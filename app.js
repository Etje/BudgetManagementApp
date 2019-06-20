var UIController = (function() {

    var DomStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabels: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    
    var formatNumber = function(num, type){
        var numSplit, int, dec, type; 

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDesc).value,
                amount: parseFloat(document.querySelector(DomStrings.inputValue).value) 
            };
        }, 

        addListItem: function(obj, type) {
            var html, newHtml, element; 

            if(type === 'inc'){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DomStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);

        },

        clearFields: function(){
            var fields, fieldsArray; 

            fields = document.querySelectorAll(DomStrings.inputDesc + ', ' + DomStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DomStrings.budgetLabels).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---';        
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DomStrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        }, 

        displayMonth: function() {
            var now, year, month, months;

            now = new Date();

            months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
            year = now.getFullYear();
            month = now.getMonth(); 

            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' + 
                DomStrings.inputDesc + ',' +
                DomStrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DomStrings.inputBtn).classList.toggle('red');
        },

        getDomStrings: function() {
            return DomStrings;
        }   
    };
})();

var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id; 
        this.description = description; 
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id; 
        this.description = description; 
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0; 
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        }, 
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID; 

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    };

})();

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function() {

        var DOM = UICtrl.getDomStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', crtlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {

        //4. Calculate the budget 
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        //5. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentage();

        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {

        var input, newItem;
        //1. get field input data

        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.amount) && input.amount > 0){
            //2. add item to budgetcontroller
            newItem = budgetCtrl.addItem(input.type, input.description, input.amount);
    
            //3. add the new item to UI
            UICtrl.addListItem(newItem, input.type);
    
            //4. clear fields
            UICtrl.clearFields(); 
            
            //5. calculate and update budget
            updateBudget();

            updatePercentages(); 
        }
    }; 

    var crtlDeleteItem = function(event) {
        var itemID, splitID, type, ID; 

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages(); 

        }

    };

    return {
        init: function() {
            console.log('Application is started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();
