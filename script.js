document.addEventListener('DOMContentLoaded', () => {
    const resultDisplay = document.getElementById('result-display');
    const expressionDisplay = document.getElementById('expression-display');
    const historyContainer = document.getElementById('history-container');
    const allButtons = document.querySelectorAll('.btn');

    let currentInput = '0';
    let expression = '';
    let resultDisplayed = false;
    let history = [];

    function updateDisplay() {
        resultDisplay.textContent = currentInput;
        expressionDisplay.textContent = expression.replace(/\*/g, '×').replace(/\//g, '÷');
    }

    function updateHistoryDisplay() {
        historyContainer.innerHTML = '';
        history.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                <div class="history-expression">${entry.expression} =</div>
                <div class="history-result">${entry.result}</div>
            `;
            historyContainer.appendChild(historyItem);
        });
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }

    function handleDigit(digit) {
        if (resultDisplayed) {
            currentInput = digit;
            resultDisplayed = false;
        } else {
            if (currentInput === '0' && digit !== '.') {
                currentInput = digit;
            } else if (digit === '.' && currentInput.includes('.')) {
                return;
            } else {
                currentInput += digit;
            }
        }
        updateDisplay();
    }

    function handleOperator(op) {
        if (resultDisplayed) {
            expression = currentInput + ' ' + op + ' ';
            currentInput = '';
            resultDisplayed = false;
            updateDisplay();
            return;
        }

        if (currentInput === '' && expression !== '') {
            expression = expression.trim().slice(0, -1).trim() + ' ' + op + ' ';
        } else if (currentInput !== '') {
            expression += currentInput + ' ' + op + ' ';
        }
        
        currentInput = '';
        updateDisplay();
    }

    function handleFunction(func) {
        switch (func) {
            case 'AC':
                currentInput = '0';
                expression = '';
                resultDisplayed = false;
                history = [];
                updateHistoryDisplay();
                break;
            case '⌫':
                if (resultDisplayed) {
                    currentInput = '0';
                    resultDisplayed = false;
                } else {
                    currentInput = currentInput.slice(0, -1) || '0';
                }
                break;
            case '(':
            case ')':
                if (currentInput === '0' && !resultDisplayed) {
                    currentInput = func;
                } else {
                    currentInput += func;
                }
                break;
        }
        updateDisplay();
    }

    function calculate() {
        if (expression === '' || currentInput === '') return;

        let finalExpression = (expression + currentInput).trim();
        let displayExpression = finalExpression.replace(/\*/g, '×').replace(/\//g, '÷');
        finalExpression = finalExpression.replace(/×/g, '*').replace(/÷/g, '/');

        try {
            const result = new Function('return ' + finalExpression)();
            if (isNaN(result) || !isFinite(result)) throw new Error("Invalid");

            const resultString = String(parseFloat(result.toFixed(10)));
            
            history.push({ expression: displayExpression, result: resultString });
            if (history.length > 20) history.shift();
            updateHistoryDisplay();

            currentInput = resultString;
        } catch (error) {
            currentInput = 'Error';
        }

        expression = '';
        resultDisplayed = true;
        updateDisplay();
    }

    allButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            const value = button.textContent.trim();

            if (button.classList.contains('digit')) handleDigit(value);
            else if (button.classList.contains('operator')) handleOperator(value);
            else if (button.classList.contains('function')) handleFunction(value);
            else if (button.classList.contains('equal')) calculate();
        });
    });

    updateDisplay();
});