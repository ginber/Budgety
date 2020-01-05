// Module Pattern

// UI Controller
var UIController = (function() {
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container"
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMStrings.inputValue).value
                )
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
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (obj.type === "exp") {
                container = DOMStrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            var newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            document
                .querySelector(container)
                .insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItem: function(selectID) {
            var elem = document.getElementById(selectID);
            elem.parentNode.removeChild(elem);
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

            document.querySelector(DOMStrings.inputType).value = "inc";

            fields.item(0).focus(); // Focus on the first element of the NodeList(fields)
        },
        displayBudget: function(budgetObj) {
            document.querySelector(DOMStrings.budgetLabel).textContent =
                budgetObj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent =
                budgetObj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent =
                budgetObj.totalExp;

            if (budgetObj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent =
                    budgetObj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent =
                    "---";
            }
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

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
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
        },
        calculateBudget: function() {
            calculateTotal("inc");
            calculateTotal("exp");
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function(type, id) {
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            var index = ids.indexOf(id);
            // Delete item at 'index' if it is present
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        }
    };
})();

// General Application Controller
var controller = (function(budgetCtrl, UICtrl) {
    var updateBudget = function() {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };
    var updatePercentages = function() {};
    var ctrlAddItem = function() {
        var input = UICtrl.getInput();
        // Check user inputs
        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            var newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );
            UICtrl.addListItem(newItem);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID =
            event.target.parentNode.parentNode.parentNode.parentNode.id;
        var type, id, splitItemID;
        if (itemID) {
            splitItemID = itemID.split("-");
            type = splitItemID[0];
            id = parseInt(splitItemID[1]);
            // Delete item from the data structure
            budgetCtrl.deleteItem(type, id);
            // Delete item from UI
            UICtrl.deleteListItem(itemID);
            // Update the budget according to remaining values
            updateBudget();
            updatePercentages();
        }
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
        // Using event delegation for delete buttons
        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);
    };
    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
})(BudgetController, UIController);

controller.init();
