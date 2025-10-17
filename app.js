document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let allQuestions = [];
    let filteredQuestions = [];
    let currentQuestionIndex = 0;
    let solvedQuestions = new Set();
    let starredQuestions = new Set();
    let starredQuestionsList = [];
    let currentStarredIndex = 0;
    let bookmark = null;

    // Mock test variables
    let mockTestQuestions = [];
    let currentTestQuestionIndex = 0;
    let userTestAnswers = [];
    let timerInterval;

    // DOM Elements
    const practiceModeBtn = document.getElementById('practice-mode-btn');
    const starredModeBtn = document.getElementById('starred-mode-btn');
    const mockTestModeBtn = document.getElementById('mock-test-mode-btn');
    const practiceMode = document.getElementById('practice-mode');
    const starredMode = document.getElementById('starred-mode');
    const mockTestMode = document.getElementById('mock-test-mode');

    // Practice Mode Elements
    const sectionFilter = document.getElementById('section-filter');
    const questionJump = document.getElementById('question-jump');
    const jumpBtn = document.getElementById('jump-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const continueBookmarkBtn = document.getElementById('continue-bookmark-btn');
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    const starBtn = document.getElementById('star-btn');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    const explanation = document.getElementById('explanation');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');

    // Starred Mode Elements
    const starredQuestionImage = document.getElementById('starred-question-image');
    const starredQuestionText = document.getElementById('starred-question-text');
    const starredStarBtn = document.getElementById('starred-star-btn');
    const starredOptionsContainer = document.getElementById('starred-options-container');
    const starredFeedback = document.getElementById('starred-feedback');
    const starredExplanation = document.getElementById('starred-explanation');
    const starredPrevBtn = document.getElementById('starred-prev-btn');
    const starredNextBtn = document.getElementById('starred-next-btn');
    const starredQuestionCounter = document.getElementById('starred-question-counter');

    // Mock Test Elements
    const startScreen = document.getElementById('test-start-screen');
    const testContainer = document.getElementById('test-container');
    const resultsScreen = document.getElementById('test-results-screen');
    const startTestBtn = document.getElementById('start-test-btn');
    const testQuestionCounter = document.getElementById('test-question-counter');
    const timerDisplay = document.getElementById('timer');
    const testQuestionImage = document.getElementById('test-question-image');
    const testQuestionText = document.getElementById('test-question-text');
    const testStarBtn = document.getElementById('test-star-btn');
    const testOptionsContainer = document.getElementById('test-options-container');
    const testPrevBtn = document.getElementById('test-prev-btn');
    const testNextBtn = document.getElementById('test-next-btn');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const scoreDisplay = document.getElementById('score');
    const resultMessage = document.getElementById('result-message');
    const restartTestBtn = document.getElementById('restart-test-btn');
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');

    // --- Utility Functions ---

    const fetchData = async () => {
        try {
            const response = await fetch('questions.json');
            const data = await response.json();
            allQuestions = data['ddt-questions'].state.allQuestions;
            filteredQuestions = allQuestions;
            loadSolvedQuestions();
            loadStarredQuestions();
            loadBookmark();
            loadTheme();
            populateSections();
            displayQuestion();
            updateBookmarkButton();
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

    const loadStarredQuestions = () => {
        const starred = localStorage.getItem('starredDDTQuestions');
        if (starred) {
            starredQuestions = new Set(JSON.parse(starred));
            updateStarredQuestionsList();
        }
    };

    const saveStarredQuestions = () => {
        localStorage.setItem('starredDDTQuestions', JSON.stringify(Array.from(starredQuestions)));
        updateStarredQuestionsList();
    };

    const updateStarredQuestionsList = () => {
        starredQuestionsList = allQuestions.filter(q => starredQuestions.has(q.index));
    };

    const loadBookmark = () => {
        const savedBookmark = localStorage.getItem('ddtBookmark');
        if (savedBookmark) {
            bookmark = JSON.parse(savedBookmark);
        }
    };

    const saveBookmark = () => {
        localStorage.setItem('ddtBookmark', JSON.stringify(bookmark));
    };

    // Theme management
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('ddtTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeToggle(savedTheme);
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ddtTheme', newTheme);
        updateThemeToggle(newTheme);
    };

    const updateThemeToggle = (theme) => {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    };

    const toggleStar = (questionIndex) => {
        if (starredQuestions.has(questionIndex)) {
            starredQuestions.delete(questionIndex);
        } else {
            starredQuestions.add(questionIndex);
        }
        saveStarredQuestions();
    };

    const updateStarButton = (button, questionIndex) => {
        if (starredQuestions.has(questionIndex)) {
            button.classList.add('starred');
            button.classList.remove('unstarred');
            button.textContent = '★'; // Filled star
            button.title = 'Unstar this question';
        } else {
            button.classList.add('unstarred');
            button.classList.remove('starred');
            button.textContent = '☆'; // Hollow star
            button.title = 'Star this question';
        }
    };

    const updateBookmarkButton = () => {
        if (bookmark) {
            continueBookmarkBtn.textContent = `Continue from Q${bookmark.questionIndex}`;
            continueBookmarkBtn.disabled = false;
        } else {
            continueBookmarkBtn.textContent = 'No bookmark saved';
            continueBookmarkBtn.disabled = true;
        }
        
        // Update bookmark button appearance
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        if (currentQuestion && bookmark && bookmark.questionIndex === currentQuestion.index) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.textContent = '🔖 Bookmarked';
        } else {
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.textContent = '🔗 Bookmark This Question';
        }
    };

    // --- Mode Switching ---

    const showNavigation = (navElement) => {
        // Hide all navigations first
        document.querySelectorAll('.navigation, .test-navigation').forEach(nav => {
            nav.classList.add('hidden');
        });
        // Show the specified navigation
        if (navElement) {
            navElement.classList.remove('hidden');
        }
    };

    practiceModeBtn.addEventListener('click', () => {
        practiceMode.classList.remove('hidden');
        starredMode.classList.add('hidden');
        mockTestMode.classList.add('hidden');
        practiceModeBtn.classList.add('active');
        starredModeBtn.classList.remove('active');
        mockTestModeBtn.classList.remove('active');
        showNavigation(practiceMode.querySelector('.navigation'));
    });

    starredModeBtn.addEventListener('click', () => {
        practiceMode.classList.add('hidden');
        starredMode.classList.remove('hidden');
        mockTestMode.classList.add('hidden');
        practiceModeBtn.classList.remove('active');
        starredModeBtn.classList.add('active');
        mockTestModeBtn.classList.remove('active');
        displayStarredQuestion();
        showNavigation(starredMode.querySelector('.navigation'));
    });

    mockTestModeBtn.addEventListener('click', () => {
        practiceMode.classList.add('hidden');
        starredMode.classList.add('hidden');
        mockTestMode.classList.remove('hidden');
        practiceModeBtn.classList.remove('active');
        starredModeBtn.classList.remove('active');
        mockTestModeBtn.classList.add('active');
        resetMockTestView();
        showNavigation(null); // Hide navigation for mock test start screen
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
        const onPageImage = document.getElementById('question-image');

        // 1. Immediately hide the image container. This prevents the old question's image from lingering.
        onPageImage.style.display = 'none';
        
        const imageUrl = `images/${question.index}.png`;

        // 2. Create a temporary, in-memory image object to perform the check.
        const imageChecker = new Image();

        // 3. Define what happens on success (the image exists and loaded).
        imageChecker.onload = () => {
            onPageImage.src = imageUrl;
            onPageImage.style.display = 'block';
        };

        // 4. Define what happens on failure (image does not exist).
        imageChecker.onerror = () => {
            // The real image is already hidden, so we don't need to do anything.
            onPageImage.src = '';
        };

        // 5. This kicks off the check. The browser will try to load the image into our temporary object.
        imageChecker.src = imageUrl;


        questionText.textContent = `(${question.index}) ${question.question}`;
        updateStarButton(starBtn, question.index);
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
        updateBookmarkButton(); // Update bookmark button when question changes
    };

    const displayStarredQuestion = () => {
        if (starredQuestionsList.length === 0) {
            starredQuestionText.textContent = 'No starred questions yet.';
            starredOptionsContainer.innerHTML = '';
            starredQuestionImage.style.display = 'none';
            starredStarBtn.style.display = 'none';
            updateStarredNav();
            return;
        }

        const question = starredQuestionsList[currentStarredIndex];
        const onPageImage = starredQuestionImage;

        onPageImage.style.display = 'none';
        const imageUrl = `images/${question.index}.png`;
        const imageChecker = new Image();

        imageChecker.onload = () => {
            onPageImage.src = imageUrl;
            onPageImage.style.display = 'block';
        };

        imageChecker.onerror = () => {
            onPageImage.src = '';
        };

        imageChecker.src = imageUrl;

        starredQuestionText.textContent = `(${question.index}) ${question.question}`;
        starredStarBtn.style.display = 'block';
        updateStarButton(starredStarBtn, question.index);
        starredOptionsContainer.innerHTML = '';
        starredFeedback.classList.add('hidden');

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            if (solvedQuestions.has(question.index)) {
                if (index === question.correct_answer) {
                    button.classList.add('correct');
                }
            }
            button.addEventListener('click', () => handleStarredAnswer(index, question));
            starredOptionsContainer.appendChild(button);
        });

        updateStarredNav();
    };

    const handleStarredAnswer = (selectedIndex, question) => {
        const isCorrect = selectedIndex === question.correct_answer;
        const optionButtons = starredOptionsContainer.querySelectorAll('.option');

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

        starredExplanation.textContent = `Explanation: ${question.explanation}`;
        starredFeedback.classList.remove('hidden');
    };

    const updateStarredNav = () => {
        if (starredQuestionsList.length === 0) {
            starredQuestionCounter.textContent = 'No starred questions';
            starredPrevBtn.disabled = true;
            starredNextBtn.disabled = true;
        } else {
            starredQuestionCounter.textContent = `${currentStarredIndex + 1} / ${starredQuestionsList.length}`;
            starredPrevBtn.disabled = currentStarredIndex === 0;
            starredNextBtn.disabled = currentStarredIndex === starredQuestionsList.length - 1;
        }
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

    // Star functionality
    starBtn.addEventListener('click', () => {
        const question = filteredQuestions[currentQuestionIndex];
        toggleStar(question.index);
        updateStarButton(starBtn, question.index);
    });

    starredStarBtn.addEventListener('click', () => {
        const question = starredQuestionsList[currentStarredIndex];
        toggleStar(question.index);
        updateStarButton(starredStarBtn, question.index);
        // If unstarred, remove from starred list and update display
        if (!starredQuestions.has(question.index)) {
            if (currentStarredIndex >= starredQuestionsList.length - 1) {
                currentStarredIndex = Math.max(0, starredQuestionsList.length - 2);
            }
            displayStarredQuestion();
        }
    });

    // Starred navigation
    starredPrevBtn.addEventListener('click', () => {
        if (currentStarredIndex > 0) {
            currentStarredIndex--;
            displayStarredQuestion();
        }
    });

    starredNextBtn.addEventListener('click', () => {
        if (currentStarredIndex < starredQuestionsList.length - 1) {
            currentStarredIndex++;
            displayStarredQuestion();
        }
    });

    // Bookmark functionality
    bookmarkBtn.addEventListener('click', () => {
        const question = filteredQuestions[currentQuestionIndex];
        bookmark = {
            questionIndex: question.index,
            section: sectionFilter.value,
            filteredIndex: currentQuestionIndex
        };
        saveBookmark();
        updateBookmarkButton();
        // Show a brief confirmation without alert
        const originalText = bookmarkBtn.textContent;
        bookmarkBtn.textContent = '✓ Bookmarked!';
        setTimeout(() => {
            updateBookmarkButton();
        }, 1500);
    });

    continueBookmarkBtn.addEventListener('click', () => {
        if (bookmark) {
            sectionFilter.value = bookmark.section;
            if (bookmark.section === 'all') {
                filteredQuestions = allQuestions;
            } else {
                filteredQuestions = allQuestions.filter(q => q.section === bookmark.section);
            }
            
            const questionToFind = allQuestions.find(q => q.index === bookmark.questionIndex);
            if (questionToFind) {
                currentQuestionIndex = filteredQuestions.indexOf(questionToFind);
                if (currentQuestionIndex === -1) {
                    // Question not in current filter, switch to all
                    sectionFilter.value = 'all';
                    filteredQuestions = allQuestions;
                    currentQuestionIndex = allQuestions.indexOf(questionToFind);
                }
                displayQuestion();
            }
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
        showNavigation(testContainer.querySelector('.test-navigation'));
    };

    const displayTestQuestion = () => {
        const question = mockTestQuestions[currentTestQuestionIndex];
        const onPageTestImage = document.getElementById('test-question-image');

        onPageTestImage.style.display = 'none';
        const imageUrl = `images/${question.index}.png`;
        const imageChecker = new Image();

        imageChecker.onload = () => {
            onPageTestImage.src = imageUrl;
            onPageTestImage.style.display = 'block';
        };

        imageChecker.onerror = () => {
            onPageTestImage.src = '';
        };
        
        imageChecker.src = imageUrl;

        testQuestionText.textContent = question.question;
        updateStarButton(testStarBtn, question.index);
        testOptionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            if (userTestAnswers[currentTestQuestionIndex] === index) {
            button.classList.add('selected');
        }

        // 2. Add the click event listener to handle selection
        button.addEventListener('click', () => {
        // Save the user's answer
        userTestAnswers[currentTestQuestionIndex] = index;

        // Remove 'selected' from all sibling buttons
        document.querySelectorAll('#test-options-container .option').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add 'selected' to the clicked button
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
        showNavigation(null); // Hide navigation for results screen
    };
    
    const resetMockTestView = () => {
        clearInterval(timerInterval);
        testContainer.classList.add('hidden');
        resultsScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        timerDisplay.textContent = "30:00";
        showNavigation(null); // Hide navigation for start screen
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

    // Test star functionality
    testStarBtn.addEventListener('click', () => {
        const question = mockTestQuestions[currentTestQuestionIndex];
        toggleStar(question.index);
        updateStarButton(testStarBtn, question.index);
    });

    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);

    // --- Initial Load ---
    fetchData();
});