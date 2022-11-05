const errorQueryParams = new URLSearchParams(window.location.search)

const errors = queryHasErrors() ? parseErrors() : loadErrors()

const forms = document.querySelectorAll("form")

forms.forEach(form => form.addEventListener("submit", saveInputs))

saveErrors()
loadInputs()
renderModal()

function queryHasErrors() {
    return errorQueryParams.has('error') || errorQueryParams.has('message')
}

function parseErrors() {
    let query = {}

    for (let [key, value] of errorQueryParams.entries()) {
        if (key.startsWith('error') || key.startsWith('message')) {
            query[key] = value
        }
    }

    return expand(query)
}

function saveErrors() {
    for (const [key, value] of errorQueryParams.entries()) {
        if (key.startsWith('error') || key.startsWith('message')) {
            sessionStorage.setItem(key, value)
        }
    }
}

function loadErrors() {
    let storage = {}

    for (const [key, value] of Object.entries(sessionStorage)) {
        if (key.startsWith('error') || key.startsWith('message')) {
            storage[key] = value
        }
    }

    return expand(storage)
}

function saveInputs(e) {
    for (const input of e.target.elements) {
        switch (input.name) {
            case "first_name":
            case "last_name":
            case "email":
                sessionStorage.setItem(input.name, input.value)
                break
            default:
                break
        }
    }
}

function loadInputs() {
    for (const input of ["first_name", "last_name", "email"]) {
        switch (input) {
            case "first_name":
            case "last_name":
            case "email":
                document.querySelectorAll(`input[name="${input}"]`)
                    .forEach(field => field.value = sessionStorage.getItem(input))
                break
            default:
                break
        }
    }
}

function expand(obj) {
    return Object
        .entries(obj)
        .reduce((a, [propString, name]) => {
            const propArr = propString.replace(/\[/g, '.')
                .replace(/\]/g, '')
                .split('.')

            if (propArr.length > 1) {
                const innerProp = propArr.pop(),
                    innerObj = propArr.reduce((_a, prop) => (_a[prop] ??= {}, _a[prop]), a)

                innerObj[innerProp] = name
            } else {
                a[propString] = name
            }

            return a
        }, {})
}

function renderModal() {
    if (Object.keys(errors).length > 0) {
        let modal = document.createElement("div")
        let error = errors.message ?? errors.error ?? "Server Error"

        modal.className = "errors_modal"
        modal.appendChild(Object.assign(document.createElement("h1"), {innerText: error}))

        if (Object.keys(errors.errors).length > 0) {
            for (const [field, errorList] of Object.entries(errors.errors)) {
                modal.appendChild(Object.assign(document.createElement("h2"), {innerText: field}))

                for (const error of Object.values(errorList)) {
                    modal.appendChild(Object.assign(document.createElement("p"), {innerText: error}))
                }
            }
        }

        modal.appendChild(Object.assign(document.createElement("button"),{innerText: "Close window"}))

        document.body.appendChild(modal)

        document.querySelector(".errors_modal button")
            .addEventListener("click", (e) => e.target.parentElement.classList.add('errors_modal_hidden'))
    }
}