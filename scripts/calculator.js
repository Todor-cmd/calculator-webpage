
//----------------------------------------------Global Variables--------------------------------------------------------//

const allButtons = document.querySelectorAll(`button`);
const digits = document.querySelectorAll(`#digits > button`);
const operations = document.querySelectorAll(`#operations > button`);
const clearButton = document.querySelector(`#clear`);
const computeButton = document.querySelector(`#compute`);
const displayP = document.querySelector(`#display`);
const dotButton = document.querySelector(`#dot`);
const backspaceButton = document.querySelector(`#backspace`);

let input = [];
const operatorList = [`+`, `-`, `*`, `/`];
const signs = [`+`, `-`];

//This will be used to know whether a new digit input should reset the calculator
let isPreviousResult = false;

//-------------------------------------------------Event listeners------------------------------------------------------//

allButtons.forEach((button) => {
    button.addEventListener(`click`, isPreviousError);
});

digits.forEach((button) => {
    button.addEventListener(`click`, () => {
        digitFunctionality(button.textContent);
    });
});

operations.forEach((button) => {
    button.addEventListener(`click`, () => {
        operationFunctinoality(button.textContent);
    });
});

clearButton.addEventListener(`click`, clearFunctionality);

computeButton.addEventListener(`click`, compute);

dotButton.addEventListener(`click`, dotFunctionality);

backspaceButton.addEventListener(`click`, backspaceFunctionality);

document.addEventListener(`keyup`, (event) => {
    if (isFinite(event.key)) {
        digitFunctionality(event.key);
    }
    else if(operatorList.includes(event.key)) {
        operationFunctinoality(event.key);
    }
    else if(event.key === `.`){
        dotFunctionality();
    }
    else if (event.key === `=` || event.key === `Enter`) {
        compute();
    }
    else if (event.key === `Backspace`) {
        backspaceFunctionality();
    }
    else if (event.key === `Clear` || event.key == `Delete`) {
        clearFunctionality();
    }
})

//-------------------------------------------------Event Listener Functions----------------------------------------------//

/**
 * Calculates the result of the first operation if there are at least 3 inputs
 */
function compute() {
    if (input.length >= 3) {
        isPreviousResult = true;
        try {
            //The result of the operation is rounded to two decimal places
            let result = Math.round(operate(input[1], input[0], input[2]) * 100) / 100;
            input = [result];
            displayResult(result);
            
        }
        catch (e) {
            //This clears the input and displays the error message
             //Also the dot is enabled to allow use of it(incase it was disabled)
            input=[];
            dotButton.addEventListener(`click`, dotFunctionality);
            displayP.textContent = e;
        }
    }
}

/**
 * Resets the calculator, both the display and memory(input variable).
 */
function clearFunctionality() {
    isPreviousResult = false;
    dotButton.addEventListener(`click`, dotFunctionality);
    displayP.textContent = ``;
    input = [];
}

/**
 * Performs the functionality of the dot in arithmatics.
 */
function dotFunctionality() {
    if (isPreviousResult) {
        displayP.textContent = ``;
        input = [];
    } else {
        dotButton.removeEventListener(`click`, dotFunctionality);
    }

    isPreviousResult = false;

    if (input.length === 0) {
        input.push(`0.`);
        displayP.insertAdjacentText('beforeend', dotButton.textContent);
        return;
    }

    let previous = input[input.length - 1];
    //when dot is added after a sign(not an operation)
    if(signs.includes(previous) && input.length === 1){
        input.pop();
        input.push(`${previous}0.`);
    }
    //When dot is added after operation
    else if (operatorList.includes(previous)) {
        input.push(`0.`);
    } 
    else {
        input.pop();
        input.push(previous+ `.`);
    }
    displayP.insertAdjacentText('beforeend', dotButton.textContent);
}

/**
 * Performs the functionality of the backspace.
 */
function backspaceFunctionality() {
    if (input.length === 0){
        return;
    }

    let previous = input.pop();

    //If the previous element in display is the result of user pressing '=', then delete entire element.
    if (isPreviousResult){
        displayP.textContent = displayP.textContent.slice(0, -previous.length);
        dotButton.addEventListener(`click`, dotFunctionality);
    } else {

        //If previous element in display is a dot, enable dot again.
        if (previous.slice(-1, previous.length) === `.` || previous === `.`) {
            dotButton.addEventListener(`click`, dotFunctionality);
        }
        displayP.textContent = displayP.textContent.slice(0, -1);

        //If element being deleted is part of a number with multiple digits,
        //push back the number without deleted element to memory
        if (previous.length > 1){
            input.push(previous.slice(0, -1));
        }
    } 
}

/**
 * Checks if an error message is displayed and if so clears the message.
 */
function isPreviousError() {
    if (displayP.textContent.slice(0,5) === `Error`) {
        displayP.textContent = ``;
        input =[];
    }
}

/**
 * Performs the functionality of the digit.
 * @param {String} digit - A digit thats been entered by user.
 */
function digitFunctionality(digit) {
    //Clears calculator if displayed element is result of user pressing '='
    if (isPreviousResult) {
        displayP.textContent = ``;
        input = [];
    } 

    isPreviousResult = false;
    addInput(`${digit}`);
    displayP.insertAdjacentText('beforeend', `${digit}`);
}

/**
 * Performs the functionality of the operator.
 * @param {String} operator - An operator thats been entered by the user. 
 */
function operationFunctinoality(operator) {
    dotButton.addEventListener(`click`, dotFunctionality);
    isPreviousResult = false;
    try {
        earlyComputeCheck();
        displayP.insertAdjacentText('beforeend', operator);
        addInput(operator);
    } catch (e) {
        input=[];
        displayP.textContent = e;
    }
}


//-------------------------------------------------Helper functions-----------------------------------------------------//

/**
 * Adds new input by user to the input array(used as short-term memory).
 * @param {String} newInput - The new input of the user.
 * @throws - Errors if first input is an operator or two consecutive operators are entered incorrectly.
 */
function addInput(newInput) {
    if (input.length === 0 && (operatorList.includes(newInput) && !signs.includes(newInput))) {
        throw `Error: First input cannot be an operator. Input has been cleared.`;
    }
    
    if(input.length === 0) {
        input.push(newInput);
        return;
    }

    let previous = input[input.length - 1];

    //First two if statements manage multiple sign(+ and -) inputs
    if (signs.includes(previous) && signs.includes(newInput) && previous === newInput) {
        input[input.length - 1] = `+`;
        displayP.textContent = displayP.textContent.slice(0,-2) + `+`;
    } 
    else if (signs.includes(previous) && signs.includes(newInput)){
        input[input.length - 1] = `-`;
        displayP.textContent = displayP.textContent.slice(0,-2) + `-`;
    }
    //The next if-case is when a number is added to a sign(not when the sign indicates an operation)
    else if (signs.includes(previous) && !operatorList.includes(newInput) 
        && (input.length === 1 || operatorList.includes(input[input.length - 2]))) {
            
        input.pop();
        input.push(`${previous}${newInput}`);
    }
    //The next if-case is for two numbers being joined
    else if (!operatorList.includes(previous) && !operatorList.includes(newInput)) {
        input.pop();
        input.push(previous + newInput);
    }
    //The last if-case is for two operators being input consecutively
    else if (operatorList.includes(previous) 
        && (operatorList.includes(newInput) && !signs.includes(newInput))){

        throw `Error: Two consecutive operators. Input has been cleared.`;
    }
    else {
        input.push(newInput);
    }
}

/**
 * Checks if there are already 3 elements in input, and computes if so.
 */
function earlyComputeCheck() {
    if (input.length > 2) {
        previous = input[input.length - 1];
        if (!signs.includes(previous)) {
            compute();
            isPreviousResult = false;
        }
    }
}

/**
 * Displays the result in the calulator display.
 * @param {*} result - the result to display. 
 */
function displayResult(result) {
    displayP.textContent = result;
}

/**
 * Performs the chosen operation with the chosen operands of the user.
 * @param {String} operator - The chosen operator.
 * @param {String} operandL - The chosen operand for the left side.
 * @param {String} operandR - The chosen operand for the right side.
 * @returns {float} - The result of the operations.
 */
function operate(operator, operandL, operandR) {
    switch (operator) {
        case `+`: return add(parseFloat(operandL), parseFloat(operandR));
        case `-`: return subtract(parseFloat(operandL), parseFloat(operandR));
        case `*`: return multiply(parseFloat(operandL), parseFloat(operandR));
        case `/` : return divide(parseFloat(operandL), parseFloat(operandR));
    }
}

//---------------------------------------------------Simple Mathematical functions--------------------------------------//

/**
 * Adds the left operand to the right operand.
 * @param {float} operandL - The chosen operand for the left side.
 * @param {float} operandR - The chosen operand for the right side.
 * @returns {float} - The result of the addition.
 */
function add(operandL, operandR) {
    return operandL + operandR;
}

/**
 * Subtracts the left operand from the right operand.
 * @param {float} operandL - The chosen operand for the left side.
 * @param {float} operandR - The chosen operand for the right side.
 * @returns {float} - The result of the subtraction.
 */
function subtract(operandL, operandR) {
    return operandL - operandR;
}

/**
 * Multiplies the left operand to the right operand.
 * @param {float} operandL - The chosen operand for the left side.
 * @param {float} operandR - The chosen operand for the right side.
 * @returns {float} - The result of the multiplication.
 */
function multiply(operandL, operandR) {
    return operandL * operandR;
}

/**
 * Divides the left operand by the right operand.
 * @param {float} operandL - The chosen operand for the left side.
 * @param {float} operandR - The chosen operand for the right side.
 * @returns {float} - The result of the division.
 */
function divide(operandL, operandR) {
    if (operandR === 0){
        throw `Error: Can't divide by zero. Input has been cleared.`;
    }
    return operandL / operandR;
}