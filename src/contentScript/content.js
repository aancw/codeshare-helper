function extractProjectSource() {
    const scripts = document.getElementsByTagName('script');
    let projectSourceText = '';
    let projectSlug = '';

    for (let script of scripts) {
        if (script.innerHTML.includes('projectSource:')) {
            const match = script.innerHTML.match(/projectSource:\s*"(.*?)"/);
            if (match && match[1]) {
                projectSourceText = match[1];
                //console.log("Extracted Project Source:", projectSourceText);
                chrome.storage.local.set({ projectSource: projectSourceText }, function() {
                    console.log("Frida Script saved to storage.");
                });
            }
        }
        if (script.innerHTML.includes('projectSlug:')) {
            const slugMatch = script.innerHTML.match(/projectSlug:\s*"(.*?)"/);
            if (slugMatch && slugMatch[1]) {
                projectSlug = slugMatch[1];
                console.log("Extracted Project Slug:", projectSlug);
            }
        }
    }

    if (!projectSourceText) {
        console.log("projectSource not found");
    }

    // Inject buttons into the page
    injectButtons(projectSourceText, projectSlug);
}

function injectButtons(projectSource, projectSlug) {
    if (!projectSource) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Frida Script';
    copyButton.style.marginRight = '10px';
    copyButton.style.cursor = 'pointer'; 
    copyButton.onclick = function() {
        const parsedSource = parseJsonString(projectSource); 
        navigator.clipboard.writeText(parsedSource).then(() => {
            alert('Frida Script copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download Frida Script';
    downloadButton.style.cursor = 'pointer'; 
    downloadButton.onclick = function(event) {
        event.preventDefault(); // Prevent default action (if any)
        const parsedSource = parseJsonString(projectSource); 
        const blob = new Blob([parsedSource], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${parseJsonString(projectSlug)}.js`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); 
    };

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(downloadButton);

    // Find the target element to insert the buttons after the code-info class
    const codeInfoElement = document.querySelector('.code-info');
    if (codeInfoElement) {
        codeInfoElement.parentNode.insertBefore(buttonContainer, codeInfoElement.nextSibling); // Insert buttons after the code-info
    }
}

function parseJsonString(source) {
    if (!source) return '';

    // Wrap the source in double quotes to make it a valid JSON string
    const jsonString = `"${source}"`;
    try {
        // Automatically parses escape sequences
        return JSON.parse(jsonString); 
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return source;
    }
}

extractProjectSource();