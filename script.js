// script.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing application...");
    
    const welcomeScreen = document.getElementById("welcome-screen");
    const chapterView = document.getElementById("chapter-view");
    const analysisView = document.getElementById("analysis-view");
    const chapterTitle = document.getElementById("chapter-title");
    const verseList = document.getElementById("verse-list");
    const analysisVerseNumber = document.getElementById("analysis-verse-number");
    const backToWelcomeButton = document.getElementById("back-to-welcome");
    const prevVerseButton = document.getElementById("prev-verse");
    const nextVerseButton = document.getElementById("next-verse");
    const wordList = document.getElementById("word-list");
    const wordAnalysisTitle = document.getElementById("word-analysis-title");
    const wordDetails = document.getElementById("word-details");

    let currentChapterData = null;
    let currentVerseIndex = -1;

    // Função para carregar dados do capítulo
    async function loadChapter(chapterNum) {
        console.log(`Loading chapter ${chapterNum}...`);
        try {
            const response = await fetch(`data/ruth-ch${chapterNum}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentChapterData = await response.json();
            console.log("Chapter data loaded:", currentChapterData);
            displayChapter(chapterNum);
        } catch (error) {
            console.error("Erro ao carregar o capítulo:", error);
            alert(`Erro ao carregar o capítulo ${chapterNum}. Verifique o console para mais detalhes.`);
        }
    }

    // Função para exibir o capítulo
    function displayChapter(chapterNum) {
        console.log(`Displaying chapter ${chapterNum}`);
        welcomeScreen.style.display = "none";
        analysisView.style.display = "none";
        chapterView.style.display = "block";

        chapterTitle.textContent = `Capítulo ${chapterNum}`;
        verseList.innerHTML = "";

        if (!currentChapterData || currentChapterData.length === 0) {
            verseList.innerHTML = "<p>Nenhum versículo encontrado para este capítulo.</p>";
            return;
        }

        currentChapterData.forEach((verse, index) => {
            const verseDiv = document.createElement("div");
            verseDiv.classList.add("verse-item");
            verseDiv.dataset.verseIndex = index;

            const verseNumberSpan = document.createElement("span");
            verseNumberSpan.classList.add("verse-number");
            verseNumberSpan.textContent = `${verse.verseNumber}: `;

            const hebrewTextSpan = document.createElement("span");
            hebrewTextSpan.classList.add("hebrew-text");
            hebrewTextSpan.textContent = verse.hebrewText;

            verseDiv.appendChild(verseNumberSpan);
            verseDiv.appendChild(hebrewTextSpan);
            verseList.appendChild(verseDiv);

            verseDiv.addEventListener("click", () => displayVerseAnalysis(index));
        });
    }

    // Função para exibir a análise do versículo
    function displayVerseAnalysis(verseIndex) {
        console.log(`Displaying verse analysis for index ${verseIndex}`);
        currentVerseIndex = verseIndex;
        chapterView.style.display = "none";
        welcomeScreen.style.display = "none";
        analysisView.style.display = "flex"; // Usar flex para sidebars

        const verse = currentChapterData[currentVerseIndex];
        analysisVerseNumber.textContent = `Versículo ${verse.verseNumber}`;

        wordList.innerHTML = "";
        if (verse.words && verse.words.length > 0) {
            verse.words.forEach((word, index) => {
                const wordButton = document.createElement("button");
                wordButton.classList.add("word-list-item");
                wordButton.innerHTML = `
                    <span class="hebrew-word">${word.hebrew}</span><br>
                    <span class="transliteration">${word.transliteration}</span><br>
                    <span class="basic-translation">${word.briefTranslation}</span>
                `;
                wordButton.addEventListener("click", () => displayWordDetails(word));
                wordList.appendChild(wordButton);
            });
        } else {
            wordList.innerHTML = "<p>Nenhuma palavra encontrada para este versículo.</p>";
        }

        // Limpa a área de detalhes da palavra ao entrar na análise do versículo
        wordAnalysisTitle.textContent = "Selecione uma palavra para ver sua análise";
        wordDetails.innerHTML = "<p>Clique em uma palavra na lista à esquerda para ver sua análise detalhada.</p>";

        updateNavigationButtons();
    }

    // Função para exibir detalhes da palavra
    function displayWordDetails(word) {
        console.log("Displaying word details for:", word.hebrew);
        wordAnalysisTitle.textContent = `Análise de: ${word.hebrew} (${word.transliteration})`;
        
        let analysisHTML = `
            <p><strong>Lema:</strong> ${word.lemma}`;
        
        if (word.lemmaTranslation) {
            analysisHTML += ` (${word.lemmaTranslation})`;
        }
        analysisHTML += `</p>
            <p><strong>Tradução Breve:</strong> ${word.briefTranslation}</p>
            <p><strong>Tradução Contextual:</strong> ${word.contextualTranslation}</p>
            <h3>Análise Morfológica:</h3>
            <p><strong>Classe:</strong> ${word.analysis.class}</p>`;
            
        if (word.analysis.binyan) {
            analysisHTML += `<p><strong>Binyan:</strong> ${word.analysis.binyan}</p>`;
        }
        if (word.analysis.tense) {
            analysisHTML += `<p><strong>Tempo:</strong> ${word.analysis.tense}</p>`;
        }
        if (word.analysis.pgn) {
            analysisHTML += `<p><strong>PGN:</strong> ${word.analysis.pgn}</p>`;
        }

        if (word.analysis.didactic) {
            analysisHTML += `
                <h3>Conceito Didático:</h3>
                <h4>${word.analysis.didactic.conceptTitle}</h4>`;
            
            if (word.analysis.didactic.identification && word.analysis.didactic.identification.length > 0) {
                word.analysis.didactic.identification.forEach(item => {
                    analysisHTML += `<p><strong>${item.feature}:</strong> ${item.indicator}</p>`;
                });
            }
            
            if (word.analysis.didactic.paradigm) {
                analysisHTML += `<h4>Paradigma:</h4>
                    <table class="paradigm-table">`;
                
                if (word.analysis.didactic.paradigm.headerRow) {
                    analysisHTML += `<thead>
                        <tr>${word.analysis.didactic.paradigm.headerRow.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>`;
                }
                
                analysisHTML += `<tbody>
                    ${word.analysis.didactic.paradigm.dataRows.map(row => `
                        <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                    `).join('')}
                </tbody></table>`;
            }
        }
        
        wordDetails.innerHTML = analysisHTML;
    }

    // Atualizar botões de navegação de versículo
    function updateNavigationButtons() {
        if (prevVerseButton && nextVerseButton) {
            prevVerseButton.disabled = currentVerseIndex === 0;
            nextVerseButton.disabled = currentVerseIndex === currentChapterData.length - 1;
        }
    }

    // Event Listeners para botões de capítulo
    document.querySelectorAll(".chapter-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const chapterNum = event.target.dataset.chapter;
            console.log(`Chapter button clicked: ${chapterNum}`);
            loadChapter(chapterNum);
        });
    });

    // Event Listeners para navegação de versículo
    if (backToWelcomeButton) {
        backToWelcomeButton.addEventListener("click", () => {
            console.log("Back to welcome clicked");
            analysisView.style.display = "none";
            chapterView.style.display = "none";
            welcomeScreen.style.display = "block";
        });
    }

    if (prevVerseButton) {
        prevVerseButton.addEventListener("click", () => {
            if (currentVerseIndex > 0) {
                displayVerseAnalysis(currentVerseIndex - 1);
            }
        });
    }

    if (nextVerseButton) {
        nextVerseButton.addEventListener("click", () => {
            if (currentVerseIndex < currentChapterData.length - 1) {
                displayVerseAnalysis(currentVerseIndex + 1);
            }
        });
    }

    console.log("Application initialized successfully");
});


