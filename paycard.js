const supportedCards = {
    visa, mastercard
  };

  const countries = [
    {
      code: "US",
      currency: "USD",
      currencyName: '',
      country: 'United States'
    },
    {
      code: "NG",
      currency: "NGN",
      currencyName: '',
      country: 'Nigeria'
    },
    {
      code: 'KE',
      currency: 'KES',
      currencyName: '',
      country: 'Kenya'
    },
    {
      code: 'UG',
      currency: 'UGX',
      currencyName: '',
      country: 'Uganda'
    },
    {
      code: 'RW',
      currency: 'RWF',
      currencyName: '',
      country: 'Rwanda'
    },
    {
      code: 'TZ',
      currency: 'TZS',
      currencyName: '',
      country: 'Tanzania'
    },
    {
      code: 'ZA',
      currency: 'ZAR',
      currencyName: '',
      country: 'South Africa'
    },
    {
      code: 'CM',
      currency: 'XAF',
      currencyName: '',
      country: 'Cameroon'
    },
    {
      code: 'GH',
      currency: 'GHS',
      currencyName: '',
      country: 'Ghana'
    }
  ];

  const billHype = () => {
    const billDisplay = document.querySelector('.mdc-typography--headline4');
    if (!billDisplay) return;

    billDisplay.addEventListener('click', () => {
      const billSpan = document.querySelector("[data-bill]");
      if (billSpan &&
        appState.bill &&
        appState.billFormatted &&
        appState.billFormatted === billSpan.textContent) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(appState.billFormatted)
        );
      }
    });
  };

  const appState = {};

//format user's bill as a proper currency
  const formatAsMoney = (amount, buyerCountry) => {
      let country = countries.find(c => c.country === buyerCountry);
      country = country ? country : countries[0];
      const {code, currency} = country;

      return amount.toLocaleString(`en-${code}`, {style: "currency", currency:currency});
      
  }

  const flagIfInvalid = (field, isValid) => {
      if(isValid === true) {
         return field.classList.remove("is-invalid");
      } else {return field.classList.add("is-invalid")
      };
  }

  const expiryDateFormatIsValid = (field) => {
    
    return /^\d{1,}\/\d{2}$/g.test(field.value);

  }

  //detect card type
  const detectCardType = (first4Digits) => {

      const creditCard = document.querySelector('[data-credit-card]');
      const creditCardType = document.querySelector('[data-card-type]');
      if(first4Digits.toString().startsWith(4)){
          creditCard.classList.add('is-visa');
          creditCard.classList.remove('is-mastercard');
          creditCardType.src = supportedCards.visa;
          return 'is-visa';
      } else if (first4Digits.toString().startsWith(5)){
          creditCard.classList.add('is-mastercard');
          creditCard.classList.remove('is-visa');
          creditCardType.src = supportedCards.mastercard;
          return 'is-mastercard';
      }

  }

  //Validate user's card expiry date
  const validateCardExpiryDate =() => {
      const field = document.querySelector('[data-cc-info] input:nth-child(2)');
      let [month, year]  = field.value.split('/');
      let expDate = new Date(`20${year}/${month}`);
      let now = new Date();
      let isValid = expiryDateFormatIsValid(field) && (expDate > now);
      console.log(isValid);
      flagIfInvalid(field, isValid);
      return isValid;

      //let match = expiryDateFormatIsValid(field);
     /*  const date = new Date();
      const curYear = date.getFullYear() -2000;
      const newMonth = parseInt(field.valuue.slice(0,2)); */


  }

  //Validate card holder name
  const validateCardHolderName =() => {
      const field = document.querySelector('[data-cc-info] input:nth-child(1)');
    const regex = /^[A-Za-z]{3,}[\s][a-zA-Z]{3,}$/;
    if(regex.test(field.value)){
        flagIfInvalid(field, true);
        return true;
    }else{
        flagIfInvalid(field, false);
        return false;
    }
  }

  //Implementing the Luhn Algorithm
  const validateWithLuhn = (digits) => {
      let total = 0;
      let sumOdd = 0;
      let sumEven = 0;

      for(let i=0; i < digits.length; i++) {
          if(i % 2 === 0) {
              if(digits[i] *2 > 9) {
                  sumEven += digits[i] * 2 - 9;
              }else {
                  sumEven += digits[i] * 2;
              }
          } else {
              sumOdd += digits[i];
          }
      }
      total = sumEven + sumOdd;
      return total % 10 === 0
  };

  //Validate user's card number
  const validateCardNumber =() => {
      let CardNor = '';
      const creditCardFields = document.querySelectorAll('[data-cc-digits] input');
      creditCardFields.forEach(field => {
          cardNo += field.value;
      });

      const cardNumber = cardNo.toString().split('').map(xValue => parseInt(xValue));
      const tag = document.querySelector('[data-cc-digits]');

      const isValidWithLuhn = validateWithLuhn(cardNumber);

      if(isValidWithLuhn) {
          tag.classList.remove('is-invalid');
          return true;
      } else {
          tag.classList.add('is-invalid');
          return false;
      }
  };

  //Validate Payment
  const validatePayment =() => {
      validateCardNumber();
      validateCardHolderName();
      validateCardExpiryDate();
  }

  //smart Input
  const smartInput =(event, fieldIndex, fields) => {

      const el = event.target;
      let key = event.keyCode || event.which;
      const digitP = /\d$/;

      if(fieldIndex < 4) {
          if(digitP.test(event.key)){
              if(appState.cardDigits[fieldIndex] === undefined){
                  appState.cardDigits[fieldIndex] = [];
                  appState.cardDigits[fieldIndex].push(event.key);
                  const digits = appState.cardDigits[0];
                  console.log(digits);
                  detectCardType(digits);
              } else {
                  appState.cardDigits[fieldIndex].push(event.key);
              }

              if(fieldIndex < 3){

              }

              if(fieldIndex <= 2) {
                  let value = event.target.value;
                  //detect card type value
                  if (value.length === 0) {
                      setTimeout(() => {
                          el.value = '$';
                      }, 500)
                  }
              }

              smartCursor(event,fieldIndex, fields);
          } else if (key == 37 || key == 38 || key == 40 || key == 8 || key == 46 || key == 9){
              return ;
          } else {
              event.preventDefault();
          }
      }
      

  }

  //smart Cursor
  const smartCursor =(event, fieldIndex, fields) => {

  }

  //enableSmartTyping
  const enableSmartTyping =() => {
      const iFields = document.querySelectorAll('input');
      iFields.forEach((field,index,fields) => {
          field.addEventListener('keyup', event => {
              smartCursor(event, index, fields);
          });

          field.addEventListener('keydown', event => {
              smartInput(event, index, fields)
          });
      });
  }


  //Setup UI
 const uiCanInteract =() => {
    const detectDigits = document.querySelector('[data-cc-digits] input:first-child');
    detectDigits.focus();
    const pay = document.querySelector('[data-pay-btn]');
    pay.addEventListener('click', validatePayment);
    billHype();
    enableSmartTyping();

 }

 //display cart total
 const displayCartTotal =({results}) => {
    const [data] = results;
    const {itemsInCart, buyerCountry} = data
    appState.items = itemsInCart;
    appState.country = buyerCountry;
appState.bill = itemsInCart.reduce((total, {price, qty}) => total + (qty*price),0);
appState.billFormatted = formatAsMoney(appState.bill, appState.country);

let databillElememnt = document.querySelector('[data-bill]');
databillElememnt.textContent = appState.billFormatted;
appState.cardDigits = [];
uiCanInteract();

 }


  
  const fetchBill = () => {
    const apiHost = 'https://randomapi.com/api';
    const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
    const apiEndpoint = `${apiHost}/${apiKey}`;

    fetch(apiEndpoint)
    .then(response => response.json())
    .then(data => displayCartTotal(data))
    .catch(error => {console.error(error)})
    
  };
  
  const startApp = () => {
      fetchBill();
  };

  startApp();