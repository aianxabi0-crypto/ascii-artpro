document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const outputContainer = document.getElementById('output-container');
    const asciiOutput = document.getElementById('ascii-output');
    const charSetSelect = document.getElementById('char-set');
    const resolutionInput = document.getElementById('resolution');
    const resValDisplay = document.getElementById('res-val');
    const invertedCheckbox = document.getElementById('inverted');
    const copyBtn = document.getElementById('copy-btn');

    let currentImage = null;

    // Наборы символов
    const charSets = {
        simple: " .:-=+*#%@",
        complex: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
        blocks: "█▓▒░ ",
        binary: "01 "
    };

    // Обработка Drag & Drop
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Настройки
    resolutionInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if(val < 100) resValDisplay.textContent = "Низкая";
        else if(val < 200) resValDisplay.textContent = "Средняя";
        else resValDisplay.textContent = "Высокая";
        renderAscii();
    });

    charSetSelect.addEventListener('change', renderAscii);
    invertedCheckbox.addEventListener('change', renderAscii);

    // Копирование
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(asciiOutput.innerText).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Скопировано!";
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        });
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        currentImage = img;
                        outputContainer.style.display = 'flex';
                        renderAscii();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    }

    function renderAscii() {
        if (!currentImage) return;

        const width = parseInt(resolutionInput.value);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Вычисляем высоту с учетом пропорций символа (символы обычно в 2 раза выше чем шире)
        const aspectRatio = currentImage.height / currentImage.width;
        const height = Math.floor(width * aspectRatio * 0.55); // 0.55 - коэффициент коррекции шрифта

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(currentImage, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        let chars = charSets[charSetSelect.value];
        if (invertedCheckbox.checked) {
            chars = chars.split("").reverse().join("");
        }

        let asciiStr = "";

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const offset = (i * width + j) * 4;
                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];
                // const alpha = data[offset + 3];

                // Формула яркости
                const brightness = (0.3 * r + 0.59 * g + 0.11 * b);
                
                const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
                // Инвертируем выбор индекса для правильного отображения (темное - это чернила)
                asciiStr += chars[chars.length - 1 - charIndex];
            }
            asciiStr += "\n";
        }

        asciiOutput.textContent = asciiStr;
    }
});
