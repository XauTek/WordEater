const cartData = () => { 
    const cart = document.querySelector('.js-cart');
    const prodList = document.querySelector('.js-products-list');
    const cartList = document.querySelector('.js-cart-list');
    const cartEmpty = document.querySelector('.js-cart-empty-container');
    const cartOrder = document.querySelector('.js-cart-order-container');

    // Проверяем наличие всех необходимых элементов
    if (!cart || !cartList || !cartEmpty || !cartOrder) {
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

    // Функция для обработки кликов по кнопкам +/- в корзине
    function handleCartButtons(event) {
        // Проверяем, что клик был именно по кнопке + или -
        if (!event.target.matches('.js-minus, .js-plus')) {
            return;
        }

        // Предотвращаем всплытие события
        event.stopPropagation();

        // Находим ближайший контейнер счетчика
        const counter = event.target.closest('.js-counter');
        if (!counter) {
            console.error('Counter container not found');
            return;
        }

        // Находим элементы счетчика
        const currentItems = counter.querySelector('.js-current-items');
        const minusBTN = counter.querySelector('.js-minus');
        
        if (!currentItems || !minusBTN) {
            console.error('Counter elements not found');
            return;
        }

        // Обрабатываем клик по кнопке +
        if (event.target.matches('.js-plus')) {
            console.log('Plus button clicked');
            if (updateItemCount(currentItems)) {
                minusBTN.removeAttribute('disabled');
                calculateTotal();
            }
        }
        
        // Обрабатываем клик по кнопке -
        if (event.target.matches('.js-minus')) {
            console.log('Minus button clicked');
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

    const initCart = () => {
        console.log('Initializing cart handlers...');
        
        // Удаляем все существующие обработчики
        cart.removeEventListener('click', handleCartButtons);
        cartList.removeEventListener('click', handleRemoveProduct);
        
        // Добавляем новые обработчики
        cart.addEventListener('click', handleCartButtons);
        cartList.addEventListener('click', handleRemoveProduct);

        // Добавляем обработчик для кнопок покупки только если мы на странице каталога
        if (prodList) {
            console.log('Product list found, adding buy button handlers...');
            prodList.removeEventListener('click', handleAddToCart);
            prodList.addEventListener('click', handleAddToCart);
        }
    };

    const renderProductCart = (prodInfo) => {
        console.log('Rendering product in cart:', prodInfo);
        
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

    // Инициализация корзины только один раз
    if (!window.cartInitialized) {
        console.log('First time cart initialization');
        initCart();
        window.cartInitialized = true;
    }
    
    toggleCartStatus();
    calculateTotal();
};

export {
    cartData
};