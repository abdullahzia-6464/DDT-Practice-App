document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let allQuestions = [];
    let filteredQuestions = [];
    let currentQuestionIndex = 0;
    let solvedQuestions = new Set();

    // Mock test variables
    let mockTestQuestions = [];
    let currentTestQuestionIndex = 0;
    let userTestAnswers = [];
    let timerInterval;

    // DOM Elements
    const practiceModeBtn = document.getElementById('practice-mode-btn');
    const mockTestModeBtn = document.getElementById('mock-test-mode-btn');
    const practiceMode = document.getElementById('practice-mode');
    const mockTestMode = document.getElementById('mock-test-mode');

    // Practice Mode Elements
    const sectionFilter = document.getElementById('section-filter');
    const questionJump = document.getElementById('question-jump');
    const jumpBtn = document.getElementById('jump-btn');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    const explanation = document.getElementById('explanation');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');

    // Mock Test Elements
    const startScreen = document.getElementById('test-start-screen');
    const testContainer = document.getElementById('test-container');
    const resultsScreen = document.getElementById('test-results-screen');
    const startTestBtn = document.getElementById('start-test-btn');
    const testQuestionCounter = document.getElementById('test-question-counter');
    const timerDisplay = document.getElementById('timer');
    const testQuestionText = document.getElementById('test-question-text');
    const testOptionsContainer = document.getElementById('test-options-container');
    const testPrevBtn = document.getElementById('test-prev-btn');
    const testNextBtn = document.getElementById('test-next-btn');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const scoreDisplay = document.getElementById('score');
    const resultMessage = document.getElementById('result-message');
    const restartTestBtn = document.getElementById('restart-test-btn');

    // --- Utility Functions ---

    const fetchData = async () => {
        try {
            const response = await fetch('questions.json');
            const data = await response.json();
            allQuestions = data['ddt-questions'].state.allQuestions;
            filteredQuestions = allQuestions;
            loadSolvedQuestions();
            populateSections();
            displayQuestion();
        } catch (error) {
            console.error('Error fetching questions:', error);
            questionText.textContent = 'Failed to load questions.';
        }
    };

    const loadSolvedQuestions = () => {
        const solved = localStorage.getItem('solvedDDTQuestions');
        if (solved) {
            solvedQuestions = new Set(JSON.parse(solved));
        }
    };

    const saveSolvedQuestions = () => {
        localStorage.setItem('solvedDDTQuestions', JSON.stringify(Array.from(solvedQuestions)));
    };

    // --- Mode Switching ---

    practiceModeBtn.addEventListener('click', () => {
        practiceMode.classList.remove('hidden');
        mockTestMode.classList.add('hidden');
        practiceModeBtn.classList.add('active');
        mockTestModeBtn.classList.remove('active');
    });

    mockTestModeBtn.addEventListener('click', () => {
        practiceMode.classList.add('hidden');
        mockTestMode.classList.remove('hidden');
        practiceModeBtn.classList.remove('active');
        mockTestModeBtn.classList.add('active');
        resetMockTestView();
    });

    // --- Practice Mode Logic ---

    const populateSections = () => {
        const sections = [...new Set(allQuestions.map(q => q.section))];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionFilter.appendChild(option);
        });
    };

    const displayQuestion = () => {
        if (filteredQuestions.length === 0) {
            questionText.textContent = 'No questions found.';
            optionsContainer.innerHTML = '';
            return;
        }

        const question = filteredQuestions[currentQuestionIndex];
        questionText.textContent = `(${question.index}) ${question.question}`;
        optionsContainer.innerHTML = '';
        feedback.classList.add('hidden');

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            if (solvedQuestions.has(question.index)) {
                if (index === question.correct_answer) {
                    button.classList.add('correct');
                }
            }
            button.addEventListener('click', () => handleAnswer(index, question));
            optionsContainer.appendChild(button);
        });

        updatePracticeNav();
    };

    const handleAnswer = (selectedIndex, question) => {
        const isCorrect = selectedIndex === question.correct_answer;
        const optionButtons = optionsContainer.querySelectorAll('.option');

        if (isCorrect) {
            solvedQuestions.add(question.index);
            saveSolvedQuestions();
        }

        optionButtons.forEach((button, index) => {
            if (index === question.correct_answer) {
                button.classList.add('correct');
            } else if (index === selectedIndex) {
                button.classList.add('incorrect');
            }
            button.disabled = true;
        });

        explanation.textContent = `Explanation: ${question.explanation}`;
        feedback.classList.remove('hidden');
    };
    
    const updatePracticeNav = () => {
        questionCounter.textContent = `${currentQuestionIndex + 1} / ${filteredQuestions.length}`;
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === filteredQuestions.length - 1;
    };

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        }
    });

    sectionFilter.addEventListener('change', () => {
        const selectedSection = sectionFilter.value;
        if (selectedSection === 'all') {
            filteredQuestions = allQuestions;
        } else {
            filteredQuestions = allQuestions.filter(q => q.section === selectedSection);
        }
        currentQuestionIndex = 0;
        displayQuestion();
    });

    jumpBtn.addEventListener('click', () => {
        const questionIndex = parseInt(questionJump.value);
        const questionToFind = allQuestions.find(q => q.index === questionIndex);
        if (questionToFind) {
            sectionFilter.value = 'all';
            filteredQuestions = allQuestions;
            currentQuestionIndex = allQuestions.indexOf(questionToFind);
            displayQuestion();
        } else {
            alert('Question number not found.');
        }
    });


    // --- Mock Test Logic ---
    
    const startTest = () => {
        // Shuffle and pick 40 questions
        mockTestQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 40);
        currentTestQuestionIndex = 0;
        userTestAnswers = new Array(mockTestQuestions.length).fill(null);
        
        startScreen.classList.add('hidden');
        resultsScreen.classList.add('hidden');
        testContainer.classList.remove('hidden');

        displayTestQuestion();
        startTimer(30 * 60);
    };

    const displayTestQuestion = () => {
        const question = mockTestQuestions[currentTestQuestionIndex];
        testQuestionText.textContent = question.question;
        testOptionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            if(userTestAnswers[currentTestQuestionIndex] === index) {
                button.classList.add('selected'); // A visual cue for selected answer
            }
            button.addEventListener('click', () => {
                userTestAnswers[currentTestQuestionIndex] = index;
                // Simple visual feedback for selection
                document.querySelectorAll('#test-options-container .option').forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
            });
            testOptionsContainer.appendChild(button);
        });
        
        updateTestNav();
    };

    const updateTestNav = () => {
        testQuestionCounter.textContent = `Question ${currentTestQuestionIndex + 1} of ${mockTestQuestions.length}`;
        testPrevBtn.disabled = currentTestQuestionIndex === 0;
        testNextBtn.disabled = currentTestQuestionIndex === mockTestQuestions.length - 1;
    };

    const startTimer = (duration) => {
        let timer = duration;
        timerInterval = setInterval(() => {
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (--timer < 0) {
                clearInterval(timerInterval);
                submitTest();
            }
        }, 1000);
    };

    const submitTest = () => {
        clearInterval(timerInterval);
        let score = 0;
        mockTestQuestions.forEach((question, index) => {
            if (userTestAnswers[index] === question.correct_answer) {
                score++;
            }
        });

        scoreDisplay.textContent = `${score} / ${mockTestQuestions.length}`;
        if (score >= 35) {
            resultMessage.textContent = "Congratulations, you passed!";
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = "Sorry, you did not pass. Try again!";
            resultMessage.style.color = 'red';
        }

        testContainer.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
    };
    
    const resetMockTestView = () => {
        clearInterval(timerInterval);
        testContainer.classList.add('hidden');
        resultsScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        timerDisplay.textContent = "30:00";
    }

    startTestBtn.addEventListener('click', startTest);
    submitTestBtn.addEventListener('click', submitTest);
    restartTestBtn.addEventListener('click', resetMockTestView);

    testPrevBtn.addEventListener('click', () => {
        if (currentTestQuestionIndex > 0) {
            currentTestQuestionIndex--;
            displayTestQuestion();
        }
    });

    testNextBtn.addEventListener('click', () => {
        if (currentTestQuestionIndex < mockTestQuestions.length - 1) {
            currentTestQuestionIndex++;
            displayTestQuestion();
        }
    });

    // --- Initial Load ---
    fetchData();
});