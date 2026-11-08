// Calculator app (basic four-function, XP look).

export function initCalculator() {
  const calculator = document.getElementById('calculator');
  if (!calculator) return;

  const calcDisplay = document.getElementById('calculator-display');
  const MAX_DIGITS = 15;

  let currentOperand = '0';
  let previousOperand = null;
  let operator = null;
  let overwrite = true;
  let errorState = false;

  function updateCalcDisplay() {
    calcDisplay.textContent = errorState ? 'Error' : currentOperand;
  }

  function resetCalculator() {
    currentOperand = '0';
    previousOperand = null;
    operator = null;
    overwrite = true;
    errorState = false;
    updateCalcDisplay();
  }

  function computeResult(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    let result;
    switch (op) {
      case '+': result = x + y; break;
      case '−': result = x - y; break;
      case '×': result = x * y; break;
      case '÷':
        if (y === 0) return null;
        result = x / y;
        break;
      default: return null;
    }
    return parseFloat(result.toPrecision(12));
  }

  function inputDigit(digit) {
    if (errorState) return;
    if (overwrite) {
      currentOperand = digit;
      overwrite = false;
    } else if (currentOperand.replace('-', '').length < MAX_DIGITS) {
      currentOperand = currentOperand === '0' ? digit : currentOperand + digit;
    }
    updateCalcDisplay();
  }

  function inputDecimal() {
    if (errorState) return;
    if (overwrite) {
      currentOperand = '0.';
      overwrite = false;
    } else if (!currentOperand.includes('.')) {
      currentOperand += '.';
    }
    updateCalcDisplay();
  }

  function inputOperator(nextOperator) {
    if (errorState) return;
    if (operator !== null && !overwrite) {
      const result = computeResult(previousOperand, currentOperand, operator);
      if (result === null) {
        errorState = true;
        updateCalcDisplay();
        return;
      }
      previousOperand = String(result);
      currentOperand = String(result);
    } else {
      previousOperand = currentOperand;
    }
    operator = nextOperator;
    overwrite = true;
  }

  function inputEquals() {
    if (errorState || operator === null) return;
    const result = computeResult(previousOperand, currentOperand, operator);
    if (result === null) {
      errorState = true;
      updateCalcDisplay();
      return;
    }
    currentOperand = String(result);
    previousOperand = null;
    operator = null;
    overwrite = true;
    updateCalcDisplay();
  }

  calculator.querySelectorAll('[data-calc-digit]').forEach(btn => {
    btn.addEventListener('click', () => inputDigit(btn.dataset.calcDigit));
  });
  calculator.querySelectorAll('[data-calc-op]').forEach(btn => {
    btn.addEventListener('click', () => inputOperator(btn.dataset.calcOp));
  });
  calculator.querySelector('[data-calc-decimal]')?.addEventListener('click', inputDecimal);
  calculator.querySelector('[data-calc-equals]')?.addEventListener('click', inputEquals);
  calculator.querySelector('[data-calc-clear]')?.addEventListener('click', resetCalculator);
}
