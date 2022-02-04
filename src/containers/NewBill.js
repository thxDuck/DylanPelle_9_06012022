import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

const ACCEPTED_FORMAT = ["jpg", "jpeg", "png"];

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document
		this.onNavigate = onNavigate
		this.store = store
		const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
		formNewBill.addEventListener("submit", this.handleSubmit)
		const file = this.document.querySelector(`input[data-testid="file"]`)
		file.addEventListener("change", this.handleChangeFile)
		let inputs = document.querySelectorAll(`input, select`);
		if (inputs) inputs.forEach(input => {
			input.addEventListener('input', (e) => this.handleInputsRequired(e))
		})
		this.fileUrl = null
		this.fileName = null
		this.billId = null
		new Logout({ document, localStorage, onNavigate })
	}
	handleInputsRequired = (e) => {
		const requiredInputs = document.querySelectorAll(`.require`)
		let inputFile = document.querySelector(`input[type="file"]`);
		for (let i = 0; i < requiredInputs.length; i++) {
			const inputValue = requiredInputs[i].value;
			if (!inputValue) {
				inputFile.setAttribute('disabled', 'disabled')
				return false;
			}
		}
		inputFile.removeAttribute('disabled');
		return true;
	}
	handleChangeFile = e => {
		e.preventDefault();
		const file = e.target.files[0];
		const fileName = (!!file && !!file.name) ? file.name : "NULL.NULL";
		const fileFormat = fileName.slice(file.name.lastIndexOf(".") + 1, file.name.length);
		if (ACCEPTED_FORMAT.indexOf(fileFormat) === -1) {
			this.document.querySelector(`input[data-testid="file"]`).value = ""
			this.document.querySelector(`#alert-bad-format`).classList.remove("d-none");
			return false;
		} else {
			this.document.querySelector(`#alert-bad-format`).classList.add("d-none");
			const formData = new FormData()
			const email = JSON.parse(localStorage.getItem("user")).email
			formData.append("file", file)
			formData.append("email", email)
			/* istanbul ignore next */
			this.store
				.bills()
				.create({
					data: formData,
					headers: {
						noContentType: true
					}
				})
				.then(({ fileUrl, key }) => {
					this.billId = key
					this.fileUrl = fileUrl
					this.fileName = fileName
				}).catch(error => console.error(error))
		}
	}
	handleSubmit = e => {
		e.preventDefault()
		const email = JSON.parse(localStorage.getItem("user")).email
		const bill = {
			email,
			type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
			name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
			amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
			date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
			vat: e.target.querySelector(`input[data-testid="vat"]`).value,
			pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
			commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
			fileUrl: this.fileUrl,
			fileName: this.fileName,
			status: 'pending'
		}
		this.updateBill(bill)
		this.onNavigate(ROUTES_PATH['Bills'])
	}

	// not need to cover this function by tests
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH['Bills'])
				})
				.catch(error => console.error(error))
		}
	}
}