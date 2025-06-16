const cartData = () => { 
    const cart = document.querySelector('.js-cart');
    const prodList = document.querySelector('.js-products-list');
    const cartList = document.querySelector('.js-cart-list');
    const cartEmpty = document.querySelector('.js-cart-empty-container');
    const cartOrder = document.querySelector('.js-cart-order-container');

    // Проверяем наличие всех необходимых элементов
    if (!cart || !prodList || !cartList || !cartEmpty || !cartOrder) {
        console.error('Не все элементы корзины найдены');
        return;
    }

    const prodInfo = {};

    // Функция для обновления количества товаров
    function updateItemCount(element, increment = true) {
        const currentCount = parseInt(element.textContent) || 0;
        const newCount = increment ? currentCount + 1 : currentCount - 1;
        
        if (newCount >= 1 && newCount <= 99) {
            element.textContent = String(newCount);
            return true;
        }
        return false;
    }

    // Функция для добавления товара в корзину
    function handleAddToCart(event) {
        // Проверяем, что клик был именно по кнопке
        if (!event.target.matches('.js-buy-button')) {
            return;
        }

        // Если кнопка уже отключена, игнорируем клик
        if (event.target.hasAttribute('disabled')) {
            return;
        }

        // Отключаем кнопку
        event.target.setAttribute('disabled', 'disabled');

        // Предотвращаем всплытие события
        event.stopPropagation();

        const product = event.target.closest('.js-product');
        const imageC = product.querySelector('.js-image-card');
        const nameC = product.querySelector('.js-title-card');
        const priceC = product.querySelector('.js-price-card');
        const linkC = product.querySelector('.js-link-card');

        prodInfo.id = linkC.getAttribute('id');
        prodInfo.name = nameC.textContent;
        prodInfo.prices = priceC.textContent;
        prodInfo.photo = imageC.src;

        const productInCart = cartList.querySelector(`#${prodInfo.id}`);
        if(productInCart) {
            const currentItemsProduct = productInCart.querySelector('.js-current-items');
            const minusBTN = productInCart.querySelector('.js-minus');
            
            if (updateItemCount(currentItemsProduct)) {
                minusBTN.removeAttribute('disabled');
                calculateTotal();
            }
        }
        else {
            renderProductCart(prodInfo);
        }
        toggleCartStatus();

        // Включаем кнопку обратно через небольшую задержку
        setTimeout(() => {
            event.target.removeAttribute('disabled');
        }, 300);
    }

    // Функция для обработки кликов по кнопкам +/- в корзине
    function handleCartButtons(event) {
        if(!event.target.matches('.js-minus, .js-plus')) {
            return;
        }

        const counter = event.target.closest('.js-counter');
        const currentItems = counter.querySelector('.js-current-items');
        const minusBTN = counter.querySelector('.js-minus');

        if(event.target.matches('.js-plus')) {
            if (updateItemCount(currentItems)) {
                minusBTN.removeAttribute('disabled');
                calculateTotal();
            }
        }
        if(event.target.matches('.js-minus')) {
            if (updateItemCount(currentItems, false)) {
                if (parseInt(currentItems.textContent) === 1) {
                    minusBTN.setAttribute('disabled', true);
                }
                calculateTotal();
            }
        }
    }

    // Функция для обработки удаления товаров
    function handleRemoveProduct(event) {
        if(!event.target.classList.contains('js-remove')) {
            return;
        }

        const cartItem = event.target.closest('.js-cart-item');
        cartItem.remove();
        toggleCartStatus();
        calculateTotal();
    }

    const initCart = () => {
        // Удаляем все существующие обработчики
        cart.removeEventListener('click', handleCartButtons);
        cartList.removeEventListener('click', handleRemoveProduct);
        prodList.removeEventListener('click', handleAddToCart);
        
        // Добавляем новые обработчики
        cart.addEventListener('click', handleCartButtons);
        cartList.addEventListener('click', handleRemoveProduct);
        prodList.addEventListener('click', handleAddToCart);
    };

    const renderProductCart = (prodInfo) => {
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
        calculateTotal();
    };

    const toggleCartStatus = () => {
        if(cart.querySelector('.js-cart-item')) {
            cartOrder.style.display = 'flex';
            cartEmpty.style.display = 'none';
        }
        else {
            cartEmpty.style.display = 'flex';
            cartOrder.style.display = 'none';
        }
    };

    const calculateTotal = () => {
        const cartItems = document.querySelectorAll('.js-cart-item');
        const cartTotalPrice = document.querySelector('.js-cart-total-price');
        
        let totalValue = 0;
        cartItems.forEach((item) => {
            const itemCount = item.querySelector('.js-current-items');
            const itemPrice = item.querySelector('.js-cart-prices');
            const count = parseInt(itemCount.textContent) || 0;
            const price = parseInt(itemPrice.textContent) || 0;
            const itemTotalPrice = count * price;
            totalValue += itemTotalPrice;
        });
        cartTotalPrice.textContent = String(totalValue);
    };

    // Инициализация корзины
    initCart();
    toggleCartStatus();
    calculateTotal();
};

export {
    cartData
};