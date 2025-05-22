let commandCount = 0;
let isEffectActive = false;

const options = {
  project: ["lucifer", "lucifer-multimodule", "data-analytics", "openapi-lucifer"],
  server: Array.from({length: 5}, (_, i) => `lucifer-env-${i + 1}`)
};
options.server.push('hades-env');

function populateDropdown(id, values) {
  const select = document.getElementById(id);
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  populateRadioButtons("projectOptions", options.project, "project");
  populateRadioButtons("serverOptions", options.server, "server");

  document.getElementById('branch').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      const generateBtn = document.getElementById('generateBtn');
      const copyBtn = document.getElementById('copyBtn');

      // Generate Command only if it's valid
      if (!generateBtn.disabled) {
        generateCommand();

        // Copy Command only if button is enabled after generation
        if (!copyBtn.disabled) {
          copyToClipboard();
        }
      }
    }
  });
});

function populateRadioButtons(containerId, values, groupName) {
  const container = document.getElementById(containerId);
  values.forEach((value, index) => {
    const radioDiv = document.createElement("div");
    radioDiv.className = "radio-btn";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = groupName;
    radio.value = value;
    radio.id = `${groupName}-${index}`;

    // OpenAPI 관련 기능 유지
    if (groupName === "project") {
      radio.addEventListener('change', (e) => {
        disableServerOptions(e.target.value.includes("openapi"));
      });
    }
    radio.addEventListener('change', clearCommand);

    const label = document.createElement("label");
    label.htmlFor = `${groupName}-${index}`;
    label.textContent = value;

    radioDiv.appendChild(radio);
    radioDiv.appendChild(label);
    container.appendChild(radioDiv);
  });
}

function validateInput() {
  const branch = document.getElementById('branch').value.trim();
  const errorMsg = document.getElementById('branchError');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');

  if (branch.includes("/")) {
    errorMsg.classList.remove("hidden");
    document.getElementById('branch').classList.add("border-red-500");
    generateBtn.disabled = true;
    copyBtn.disabled = true;
  } else {
    errorMsg.classList.add("hidden");
    document.getElementById('branch').classList.remove("border-red-500");
    generateBtn.disabled = false;
  }
}

function generateCommand() {
  const project = document.querySelector('input[name="project"]:checked')?.value;
  const server = document.querySelector('input[name="server"]:checked')?.value;
  const branch = document.getElementById('branch').value.trim();

  if (!project) {
    alert("Please select a project");
    return;
  }
  if (!project.includes("openapi") && !server) {
    alert("Please select a server");
    return;
  }
  if (!branch || branch.includes("/")) {
    document.getElementById('branch').focus();
    return;
  }

  const serverText = server ? `name=environment,value=${server},type=PLAINTEXT` : '';
  const branchText = branch ? `name=branch,value=${branch},type=PLAINTEXT` : '';

  const finalCommand = serverText?.length > 0 ?
      `@Amazon Q codebuild start-build --project-name ${project} --region ap-southeast-2 --environment-variables-override ${serverText} ${branchText}` :
      `@Amazon Q codebuild start-build --project-name ${project} --region ap-southeast-2 --environment-variables-override ${branchText}`;

  document.getElementById('command').value = finalCommand;
  document.getElementById('copyBtn').disabled = false;

  commandCount++;
  if (commandCount >= 10) {
    commandCount = 0;
    triggerLightSpeedEffect();
  }
}

function triggerLightSpeedEffect() {
  if (isEffectActive) return;
  isEffectActive = true;

  setTimeout(() => {
    speed = 500;
    webglBackground.style.display = 'none';
    isEffectActive = false;
  }, 5000);
}

function copyToClipboard() {
  const textarea = document.getElementById('command');
  navigator.clipboard.writeText(textarea.value).then(() => {
    alert("Command copied to clipboard!");
  });
}

function clearCommand() {
  document.getElementById('command').value = "";
  document.getElementById('copyBtn').disabled = true;
}

function resetForm() {
  document.getElementById('branch').value = "";
  clearCommand();

  document.querySelectorAll('input[name="project"]').forEach(radio => radio.checked = false);
  document.querySelectorAll('input[name="server"]').forEach(radio => radio.checked = false);

  document.getElementById('branchError').classList.add("hidden");

  document.getElementById('generateBtn').disabled = true;
  document.getElementById('copyBtn').disabled = true;
}

function disableServerOptions(disable) {
  const servers = document.querySelectorAll('input[name="server"]');
  servers.forEach(server => {
    server.checked = false;
    server.disabled = disable;
  });
}
