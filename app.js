// Module Pattern

// UI Controller
var UIController = (function() {
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list"
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription)
                    .value,
                value: document.querySelector(DOMStrings.inputValue).value
            };
        },
        getDOMStrings: function() {
            return DOMStrings;
        },
        addListItem: function(obj) {
            var html, container;
            if (obj.type === "inc") {
                container = DOMStrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (obj.type === "exp") {
                container = DOMStrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            var newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            document
                .querySelector(container)
                .insertAdjacentHTML("beforeend", newHtml);
        },
        clearFields: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputDescription + ", " + DOMStrings.inputValue
            );
            // Back then forEach wasn't defined in NodeList.prototype, so we needed to call forEach
            // from Array.prototype like this:
            // Array.prototype.slice.call(fields);

            fields.forEach(function(current, index, wholeArray) {
                current.value = "";
            });

            fields.item(0).focus(); // Focus on the first element of the NodeList(fields)
        }
    };
})();

// Budget Controller
var BudgetController = (function() {
    // An object to represent transitions of user for this month
    var Transition = function(type, id, description, value) {
        this.type = type;
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        }
    };

    return {
        addItem: function(type, description, value) {
            if (type && (type === "inc" || type === "exp")) {
                var newItem, id;

                if (data.allItems[type].length > 0) {
                    id =
                        data.allItems[type][data.allItems[type].length - 1].id +
                        1;
                } else {
                    id = 0;
                }
                newItem = new Transition(type, id, description, value);
                data.allItems[type].push(newItem);
                return newItem;
            }
        }
    };
})();

// General Application Controller
var controller = (function(budgetCtrl, UICtrl) {
    var ctrlAddItem = function() {
        var input = UICtrl.getInput();
        var newItem = budgetCtrl.addItem(
            input.type,
            input.description,
            input.value
        );
        UICtrl.addListItem(newItem);
        UICtrl.clearFields();
    };

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        // EventListener for add button
        document
            .querySelector(DOM.addButton)
            .addEventListener("click", ctrlAddItem);

        // EventListener for "enter" key
        document.addEventListener("keypress", function(event) {
            // If the pressed key is "enter"
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };
    return {
        init: function() {
            setupEventListeners();
        }
    };
})(BudgetController, UIController);

controller.init();
