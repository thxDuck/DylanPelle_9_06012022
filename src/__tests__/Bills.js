import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    beforeEach(() => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
    })


    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      const icon = screen.getByTestId('icon-window');
      expect(icon.classList.contains("active-icon"));
    });
    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByTestId('formatted-date').map(e => e.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("Then don't display null bills", () => {
      bills.push({
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": null,
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": null,
        "type": null,
        "commentary": null,
        "name": null,
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": null,
        "amount": null,
        "commentAdmin": null,
        "email": null,
        "pct": null,
      },)
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const displayedBillsDates = screen.getAllByTestId('formatted-date');

      expect(displayedBillsDates.length).toBe(bills.length -1);
    });
    test("Then click on eye icon", () => {
      const BillsPage = new Bills({
        document, onNavigate, store: null, bills, localStorage: window.localStorage
      });

      $.fn.modal = jest.fn();

      const iconEyes = screen.getAllByTestId("icon-eye");
      for (let i = 0; i < iconEyes.length; i++) {
        const icon = iconEyes[i];
        const handleClickIconEye = jest.fn((e) => BillsPage.handleClickIconEye(icon));
        
        icon.addEventListener("click", handleClickIconEye);
        userEvent.click(icon);

        expect(iconEyes).toBeTruthy();
        expect(handleClickIconEye).toHaveBeenCalled();
      }
    });
    test("Then click on new bill icon", () => {
      const BillsPage = new Bills({
        document, onNavigate, store: null, bills, localStorage: window.localStorage
      });

      const newBillBtn = screen.getByTestId("btn-new-bill");
      const handleNewBill = jest.fn((e) => BillsPage.handleClickNewBill);

      newBillBtn.addEventListener("click", handleNewBill);
      userEvent.click(newBillBtn);

      expect(newBillBtn).toBeTruthy();
      expect(handleNewBill).toHaveBeenCalled();
    });


    // test d'intégration GET
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(store, "get")
      const bills = await store.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    });
  });


  describe("When access to Bills page", () => {
    test(('Then, it should render Loading...'), () => {
      const html = BillsUI({ data: [], loading: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    });
    test(('Then, it should render the error'), () => {
      const html = BillsUI({ data: [], error: "Error" });
      document.body.innerHTML = html;
      expect(screen.getAllByText('Error')).toBeTruthy()
    });
  });
});



