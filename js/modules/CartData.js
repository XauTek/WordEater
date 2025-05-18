const cartData = () => { 
    const cart = document.querySelector('.js-cart');
    const prodList = document.querySelector('.js-products-list');
    const cartList = document.querySelector('.js-cart-list');
    const cartEmpty = document.querySelector('.js-cart-empty-container');
    const cartOrder = document.querySelector('.js-cart-order-container');

    const prodInfo = {};


    const updateCartIC = () => {
        cart.addEventListener('click', (event) => {
            if(!event.target.matches('.js-minus, .js-plus')) {
                return;
            }

            let currentItems, minusBTN;
            if(event.target.matches('.js-minus') || event.target.matches('.js-plus')) {
                const counter = event.target.closest('.js-counter');

                currentItems = counter.querySelector('.js-current-items');

                minusBTN = counter.querySelector('.js-minus');
            }

            if(event.target.matches('.js-plus')) {
                currentItems.textContent = ++currentItems.textContent;
                minusBTN.removeAttribute('disabled');
                calculateTotal();
            }
            if(event.target.matches('.js-minus')) {
                if(parseInt(currentItems.textContent) > 2) {
                    currentItems.textContent = --currentItems.textContent;
                }
                else {
                    currentItems.textContent = --currentItems.textContent;
                    minusBTN.setAttribute('disabled', true);
                }
                calculateTotal();
            }
        });
    };
    updateCartIC();

    const addToCart = () => {
        prodList.addEventListener('click', (event) => {
            if(!event.target.classList.contains('js-buy-button')) {
                return;
            }

            if(event.target.classList.contains('js-buy-button')) {
                //console.log(1);
                const product = event.target.closest('.js-product');

                const imageC = product.querySelector('.js-image-card');
                const nameC = product.querySelector('.js-title-card');
                const priceC = product.querySelector('.js-price-card');
                const linkC = product.querySelector('.js-link-card');

                //console.log(priceC);

                prodInfo.id = linkC.getAttribute('id');
                prodInfo.name = nameC.textContent;
                prodInfo.prices = priceC.textContent;
                prodInfo.photo = imageC.src;

                const productInCart = cartList.querySelector(`#${prodInfo.id}`);
                //console.log('prod:',productInCart);
                if(productInCart) {
                    const currentItemsProduct = productInCart.querySelector('.js-current-items');
                    const minusBTN = productInCart.querySelector('.js-minus');
                    currentItemsProduct.textContent = parseInt(currentItemsProduct.textContent) + 1;
                    minusBTN.removeAttribute(`disabled`);
                }
                else {
                     renderProductCart();
                }
                toggleCartStatus();
                calculateTotal();
            }
        });
    };
    addToCart();

    const renderProductCart = () => {
        const li = document.createElement('li');
        li.classList.add('cart-item', 'column', 'js-cart-item');

        li.innerHTML = `
            <span class="close js-remove"></span>
                <div class="cartline row jcfs aic" id="${prodInfo.id}">
                    <div class="cart-image-container">
                        <img src="${prodInfo.photo}" alt="" class="cart-img">
                    </div>
                    <div class="column">
                        <div class="cart-model row jcfs aic">
                            ${prodInfo.name}
                        </div>
                        <div class="row jcsb aic">
                            <div class="counter row jcc aic js-counter">
                                <button type="button" class="minus control row jcc aic js-minus" disabled>-</button>
                                <div class="current-items row jcc aic js-current-items">1</div>
                                <button type="button" class="plus control row jcc aic js-plus">+</button>
                            </div>
                            <div class="row jcc aic">
                                <span class="cart-price  row jcfe js-cart-prices" data-prices="${prodInfo.prices}">${prodInfo.prices}</span>
                                <span class="rouble">₽</span>
                            </div>
                        </div>
                    </div>
                </div>
        `;
        cartList.append(li);
    };

    const removeProdFromCart = () => {
        cartList.addEventListener('click', (event) => {
            if(!event.target.classList.contains('js-remove')) {
                return;
            }

            if(event.target.classList.contains('js-remove')) {
                const cartItem = event.target.closest('.js-cart-item');
                cartItem.remove();
                toggleCartStatus();
                calculateTotal();
            }
        });
    };
    removeProdFromCart();

    const toggleCartStatus = () => {
        if(cart.querySelector('.js-cart-item')) {
            cartOrder.classList.remove('hidden');
            cartEmpty.classList.add('hidden');
        }
        else {
            cartEmpty.classList.remove('hidden');
            cartOrder.classList.add('hidden');
        }
    };
    toggleCartStatus();

    const calculateTotal = () => {
        const cartItems = document.querySelectorAll('.js-cart-item');
        const cartTotalPrice = document.querySelector('.js-cart-total-price');
        
        let totalValue = 0;
        cartItems.forEach((item) => {
            const itemCount = item.querySelector('.js-current-items');
            //console.log('count:',itemCount);
            const itemPrice = item.querySelector('.js-cart-prices');
            //console.log('price:',itemPrice);
            const itemTotalPrice = parseInt(itemCount.textContent) * parseInt(itemPrice.textContent);
            //console.log('total:',itemTotalPrice);

            totalValue += itemTotalPrice;
        });
        cartTotalPrice.textContent = totalValue;
    };
    calculateTotal();
};





export {
    cartData
};