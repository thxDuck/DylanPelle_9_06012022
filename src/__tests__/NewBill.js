import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Store from "../app/Store"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;
    })
    const html = NewBillUI();
    document.body.innerHTML = html;
    let inputs = {
      select: screen.getByTestId('expense-type'),
      name: screen.getByTestId('expense-name'),
      datepicker: screen.getByTestId('datepicker'),
      amount: screen.getByTestId('amount'),
      vat: screen.getByTestId('vat'),
      pct: screen.getByTestId('pct'),
      commentary: screen.getByTestId('commentary'),
      file: screen.getByTestId('file'),
    }


    // inputs = {
    //   select: document.querySelector('expense-type'),
    //   name: document.querySelector('[data-testid="expense-name'),
    //   datepicker: document.querySelector('[data-testid="datepicker'),
    //   amount: document.querySelector('[data-testid="amount'),
    //   vat: document.querySelector('[data-testid="vat'),
    //   pct: document.querySelector('[data-testid="pct'),
    //   commentary: document.querySelector('[data-testid="commentary'),
    //   file: document.querySelector('[data-testid="file'),
    // }

    test("Then mail icon in vertical layout should be highlighted", () => {
      const icon = screen.getByTestId('icon-mail');
      expect(icon.classList.contains("active-icon"))
    })
    test("Then inputs should be empty", () => {
      for (const input in inputs) {
        if (Object.hasOwnProperty.call(inputs, input)) {
          if (inputs[input].tagName !== "SELECT") {
            const value = inputs[input].value;
            expect(!!value).toBeFalsy();
          }
        }
      }
    });

    describe("When I fill form", () => {
      test("Then until all required inputs were not filled", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        let inputs = {
          select: screen.getByTestId('expense-type'),
          name: screen.getByTestId('expense-name'),
          datepicker: screen.getByTestId('datepicker'),
          amount: screen.getByTestId('amount'),
          vat: screen.getByTestId('vat'),
          pct: screen.getByTestId('pct'),
          commentary: screen.getByTestId('commentary'),
          file: screen.getByTestId('file'),
        }
        inputs.datepicker.value = "2022-01-25";
        inputs.amount.value = 100;
        inputs.vat.value = 80;
        inputs.pct.value = 20;
        inputs.commentary.value = "Test de Julien";
        inputs.name.value = "";
        inputs.select.value = "Transports";

        const NewBillPage = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

        const handleInputsMok = jest.fn((e) => NewBillPage.handleInputsRequired(e));
        let requiredInputs = document.querySelectorAll(`input, select`);
        for (let i = 0; i < requiredInputs.length; i++) {
          const input = requiredInputs[i];
          input.addEventListener("input", handleInputsMok);
        }

        fireEvent.input(inputs.select)

        expect(handleInputsMok).toHaveBeenCalled();
        expect(inputs.file.hasAttribute('disabled')).toBeTruthy();
      });
      test("Then all required inputs are filled", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        let inputs = {
          select: screen.getByTestId('expense-type'),
          name: screen.getByTestId('expense-name'),
          datepicker: screen.getByTestId('datepicker'),
          amount: screen.getByTestId('amount'),
          vat: screen.getByTestId('vat'),
          pct: screen.getByTestId('pct'),
          commentary: screen.getByTestId('commentary'),
          file: screen.getByTestId('file'),
        }
        inputs.datepicker.value = "2022-01-25";
        inputs.amount.value = 100;
        inputs.vat.value = 80;
        inputs.pct.value = 20;
        inputs.commentary.value = "Test de Julien";
        inputs.name.value = "Test de Julien";
        inputs.select.value = "Transports";

        const NewBillPage = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

        const handleInputsMok = jest.fn((e) => NewBillPage.handleInputsRequired(e));
        let requiredInputs = document.querySelectorAll(`input, select`);
        for (let i = 0; i < requiredInputs.length; i++) {
          const input = requiredInputs[i];
          input.addEventListener("input", handleInputsMok);
        }

        fireEvent.input(inputs.select)

        expect(handleInputsMok).toHaveBeenCalled();
        expect(inputs.file.hasAttribute('disabled')).toBeFalsy();
      });



      test("Then submit an image file with good format", () => {
        let RealStore = Store;
        console.error = jest.fn();
        const NewBillPage = new NewBill({ document, onNavigate, store: RealStore, localStorage: window.localStorage });

        let fileInput = inputs.file;
        let file = new File(['(⌐□_□)'], 'johnDoe.png', { type: 'image/png' });

        const handleChangeFileMok = jest.fn((e) => NewBillPage.handleChangeFile(e));
        fileInput.addEventListener("change", handleChangeFileMok);

        fireEvent.change(fileInput, {
          target: {
            files: [file]
          }
        });

        expect(fileInput).toBeTruthy();
        expect(handleChangeFileMok).toHaveBeenCalled();
      });

      test("Then submit an image file with bad format", () => {
        const NewBillPage = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })

        let fileInput = inputs.file;
        let file = new File(['(⌐□_□)'], 'johnDoe.webp', { type: 'image/webp' })

        const handleChangeFileMok = jest.fn((e) => NewBillPage.handleChangeFile(e))
        fileInput.addEventListener("change", handleChangeFileMok)
        fireEvent.change(fileInput, {
          target: {
            files: [file]
          }
        });

        expect(!!fileInput.value).toBeFalsy();
        expect(screen.getAllByText("Erreur ! Merci d'entrer un fichier image au format .jpg, .jpeg, .png")).toBeTruthy();
        expect(handleChangeFileMok).toHaveBeenCalled();
      });

      test("Then I fill all required inputs", () => {
        let RealStore = Store;
        console.error = jest.fn();

        const NewBillPage = new NewBill({ document, onNavigate, store: RealStore, localStorage: window.localStorage });
        let form = screen.getByTestId('form-new-bill');
        let submitButton = screen.getByTestId('btn-submit-form');

        inputs.select.value = "Transports";
        inputs.name.value = "Taxi";
        inputs.datepicker.value = "25-01-2022";
        inputs.amount.value = 100;
        inputs.vat.value = 80;
        inputs.pct.value = 20;
        inputs.commentary.value = "Test de Julien";

        const sumbmitFn = jest.fn((e) => NewBillPage.handleSubmit(e));
        const spyUpdateBill = jest.spyOn(NewBillPage, 'updateBill');

        form.addEventListener("submit", sumbmitFn);
        fireEvent.click(submitButton);

        expect(sumbmitFn).toHaveBeenCalled();
        expect(spyUpdateBill).toHaveBeenCalled();
      });

    });
  });
});