import { cartData } from './modules/CartData.js';

// Функционал корзины
const cart = document.querySelector('.js-cart');
const overlay = document.querySelector('.js-overlay');
const openCartBtn = document.querySelector('.js-cart-btn');
const closeCartEl = document.querySelectorAll('.js-close-cart');

// Проверяем наличие всех необходимых элементов
const hasAllElements = () => {
    return cart && overlay && openCartBtn && closeCartEl.length > 0;
};

const getScrollWidth = () => {
    let div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.overflowY = 'scroll';
    div.style.visibility = 'hidden';
    document.body.append(div);
    let scrollWidth = div.offsetWidth - div.clientWidth;
    div.remove();
    return scrollWidth;
};

const scroll = getScrollWidth();

const toggleCart = (isActive) => {
    if (!hasAllElements()) return;
    
    document.body.style.overflow = isActive ? 'hidden' : '';
    document.body.style.marginRight = isActive ? `${scroll}px` : '0px';
    cart.classList.toggle('active', isActive);
    overlay.classList.toggle('active', isActive);
}

// Обработчики событий для корзины
function handleOpenCart() {
    console.log('Opening cart...');
    toggleCart(true);
}

function handleCloseCart() {
    console.log('Closing cart...');
    toggleCart(false);
}

// Функционал выбора способа доставки
function openDeliveryModal() {
    const deliveryModal = document.querySelector('.delivery-modal');
    if (deliveryModal) {
        deliveryModal.classList.add('active');
    }
}

// Экспортируем функцию для использования в других модулях
export { openDeliveryModal };

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing cart...');
    
    // Инициализируем корзину
    cartData();
    
    const orderButton = document.getElementById('orderButton');
    const deliveryModal = document.querySelector('.delivery-modal');
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    const courierForm = document.querySelector('.courier-form');
    const pickupForm = document.querySelector('.pickup-form');
    const cancelButton = document.querySelector('.delivery-button.cancel');
    const confirmButton = document.querySelector('.delivery-button.confirm');
    const closeModalButton = document.querySelector('.close-modal');
    const deliveryButtons = document.querySelector('.delivery-buttons');
    let map = null;
    let markers = [];
    let currentCity = 'Москва';

    console.log('Elements found:', {
        orderButton,
        deliveryModal,
        deliveryOptions,
        courierForm,
        pickupForm,
        cancelButton,
        confirmButton,
        closeModalButton,
        deliveryButtons
    });

    // Список доступных городов
    const availableCities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Хабаровск'];

    // Координаты пунктов выдачи СДЭК по городам
    const pickupPoints = {
        'Москва': [
            { id: 'moscow1', name: 'Пункт выдачи №1', address: 'ул. Примерная, 1', coords: [55.751244, 37.618423] },
            { id: 'moscow2', name: 'Пункт выдачи №2', address: 'ул. Тестовая, 2', coords: [55.752244, 37.619423] },
            { id: 'moscow3', name: 'Пункт выдачи №3', address: 'ул. Пробная, 3', coords: [55.753244, 37.620423] }
        ],
        'Санкт-Петербург': [
            { id: 'spb1', name: 'Пункт выдачи №1', address: 'Невский пр., 1', coords: [59.934280, 30.335099] },
            { id: 'spb2', name: 'Пункт выдачи №2', address: 'Лиговский пр., 2', coords: [59.928280, 30.345099] },
            { id: 'spb3', name: 'Пункт выдачи №3', address: 'Московский пр., 3', coords: [59.924280, 30.325099] }
        ],
        'Екатеринбург': [
            { id: 'ekb1', name: 'Пункт выдачи №1', address: 'пр. Ленина, 1', coords: [56.838011, 60.597465] },
            { id: 'ekb2', name: 'Пункт выдачи №2', address: 'ул. Мира, 2', coords: [56.848011, 60.607465] },
            { id: 'ekb3', name: 'Пункт выдачи №3', address: 'ул. Свердлова, 3', coords: [56.858011, 60.617465] }
        ],
        'Хабаровск': [
            { id: 'khab1', name: 'Пункт выдачи №1', address: 'ул. Ленина, 1', coords: [48.480223, 135.071917] },
            { id: 'khab2', name: 'Пункт выдачи №2', address: 'ул. Карла Маркса, 2', coords: [48.485223, 135.076917] },
            { id: 'khab3', name: 'Пункт выдачи №3', address: 'ул. Дзержинского, 3', coords: [48.490223, 135.081917] }
        ]
    };

    // Инициализация карты
    function initMap() {
        if (map) {
            map.destroy();
            markers = [];
        }

        const cityCoords = {
            'Москва': [55.751244, 37.618423],
            'Санкт-Петербург': [59.934280, 30.335099],
            'Екатеринбург': [56.838011, 60.597465],
            'Хабаровск': [48.480223, 135.071917]
        };

        map = new ymaps.Map('map', {
            center: cityCoords[currentCity],
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем маркеры на карту для текущего города
        pickupPoints[currentCity].forEach(point => {
            const marker = new ymaps.Placemark(point.coords, {
                balloonContent: `<strong>${point.name}</strong><br>${point.address}`
            }, {
                preset: 'islands#blueStretchyIcon'
            });

            marker.events.add('click', () => {
                const select = pickupForm.querySelector('select:last-child');
                const option = Array.from(select.options).find(opt => opt.value === point.id);
                if (option) {
                    select.value = point.id;
                    // Создаем и вызываем событие change
                    const event = new Event('change', { bubbles: true });
                    select.dispatchEvent(event);
                }
            });

            markers.push(marker);
            map.geoObjects.add(marker);
        });
    }

    // Обновление списка пунктов выдачи при смене города
    function updatePickupPoints(city) {
        const select = pickupForm.querySelector('select:last-child');
        select.innerHTML = '<option value="">Выберите пункт выдачи СДЭК</option>';
        
        pickupPoints[city].forEach(point => {
            const option = document.createElement('option');
            option.value = point.id;
            option.textContent = `${point.name} - ${point.address}`;
            select.appendChild(option);
        });
    }

    // Создаем и добавляем datalist для автозаполнения городов
    function createCityDatalist() {
        const datalist = document.createElement('datalist');
        datalist.id = 'cities';
        
        availableCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            datalist.appendChild(option);
        });

        document.body.appendChild(datalist);
    }

    // Настройка обработчиков для выпадающих списков городов
    function setupCitySelects() {
        const citySelects = document.querySelectorAll('.city-select');
        citySelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const city = e.target.value;
                if (pickupPoints[city]) {
                    currentCity = city;
                    updatePickupPoints(city);
                    if (typeof ymaps !== 'undefined') {
                        initMap();
                    }
                }
            });
        });
    }

    // Обработчик изменения в формах
    function setupFormListeners() {
        const forms = [courierForm, pickupForm];
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    checkFormValidity();
                });
                input.addEventListener('input', () => {
                    checkFormValidity();
                });
            });
        });

        // Добавляем отдельный обработчик для select'а пункта выдачи
        const pickupSelect = pickupForm.querySelector('select:last-child');
        if (pickupSelect) {
            pickupSelect.addEventListener('change', () => {
                checkFormValidity();
            });
        }
    }

    // Функция проверки заполнения формы
    function checkFormValidity() {
        const activeOption = document.querySelector('.delivery-option.active');
        if (!activeOption) {
            confirmButton.disabled = true;
            return;
        }

        const deliveryType = activeOption.querySelector('input').value;
        let isValid = false;

        if (deliveryType === 'courier') {
            const inputs = courierForm.querySelectorAll('input');
            isValid = Array.from(inputs).every(input => input.value.trim() !== '');
        } else {
            const pickupSelect = pickupForm.querySelector('select:last-child');
            isValid = pickupSelect && pickupSelect.value !== '';
        }

        confirmButton.disabled = !isValid;
    }

    // Функция очистки корзины
    function clearCart() {
        console.log('Clearing cart...');
        
        // Очищаем содержимое корзины
        const cartEmptyContainer = document.querySelector('.cart-empty-container');
        const cartOrderContainer = document.querySelector('.cart-order-container');
        if (cartEmptyContainer && cartOrderContainer) {
            cartEmptyContainer.style.display = 'flex';
            cartOrderContainer.style.display = 'none';
        }

        // Сбрасываем итоговую сумму
        const totalPrice = document.querySelector('.total-price');
        if (totalPrice) {
            totalPrice.textContent = '0';
        }

        // Очищаем список товаров
        const cartList = document.querySelector('.js-cart-list');
        if (cartList) {
            cartList.innerHTML = '';
        }

        // Очищаем данные корзины
        if (window.cart) {
            window.cart.items = [];
            window.cart.total = 0;
        }

        // Закрываем модальное окно и убираем затемнение
        if (deliveryModal) {
            deliveryModal.classList.remove('active');
            deliveryModal.style.display = 'none';
        }

        // Убираем оверлей
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Сбрасываем формы
        if (courierForm) courierForm.reset();
        if (pickupForm) pickupForm.reset();

        // Убираем активные классы
        const activeOption = document.querySelector('.delivery-option.active');
        if (activeOption) {
            activeOption.classList.remove('active');
        }

        // Сбрасываем состояние кнопок
        if (confirmButton) {
            confirmButton.disabled = true;
        }

        // Закрываем корзину
        toggleCart(false);

        // Переинициализируем корзину
        cartData();
    }

    // Функция рендеринга товара в корзине
    function renderProductCart(prodInfo) {
        const cartList = document.querySelector('.js-cart-list');
        if (!cartList) return;

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
                            <span class="cart-price row jcfe js-cart-prices" data-prices="${prodInfo.prices}">${prodInfo.prices}</span>
                            <span class="rouble">₽</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        cartList.append(li);
    }

    // Функция переключения статуса корзины
    function toggleCartStatus() {
        const cart = document.querySelector('.js-cart');
        const cartOrder = document.querySelector('.js-cart-order-container');
        const cartEmpty = document.querySelector('.js-cart-empty-container');

        if (cart.querySelector('.js-cart-item')) {
            cartOrder.style.display = 'flex';
            cartEmpty.style.display = 'none';
        } else {
            cartEmpty.style.display = 'flex';
            cartOrder.style.display = 'none';
        }
    }

    // Функция подсчета общей суммы
    function calculateTotal() {
        const cartItems = document.querySelectorAll('.js-cart-item');
        const cartTotalPrice = document.querySelector('.js-cart-total-price');
        
        let totalValue = 0;
        cartItems.forEach((item) => {
            const itemCount = item.querySelector('.js-current-items');
            const itemPrice = item.querySelector('.js-cart-prices');
            const itemTotalPrice = parseInt(itemCount.textContent) * parseInt(itemPrice.textContent);
            totalValue += itemTotalPrice;
        });
        cartTotalPrice.textContent = totalValue;
    }

    // Функция сброса состояния корзины
    function resetCartState() {
        console.log('Resetting cart state...');
        const cart = document.querySelector('.js-cart');
        console.log('Found cart element in reset:', cart);
        if (cart) {
            console.log('Showing cart...');
            cart.classList.remove('active');
            console.log('Cart styles after reset:', cart.style.cssText);
        } else {
            console.error('Cart element not found in reset!');
        }
        // Сбрасываем формы
        if (courierForm) courierForm.reset();
        if (pickupForm) pickupForm.reset();
        // Убираем активные классы
        deliveryOptions.forEach(opt => opt.classList.remove('active'));
        if (courierForm) courierForm.classList.remove('active');
        if (pickupForm) pickupForm.classList.remove('active');
        // Сбрасываем город на Москву
        currentCity = 'Москва';
        // Показываем кнопки
        if (deliveryButtons) {
            deliveryButtons.style.display = 'flex';
        }
        // Убираем затемнение
        const overlay = document.querySelector('.js-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            console.log('Overlay removed in reset');
        }
        // Принудительно убираем затемнение с body
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';

        // Сбрасываем счетчик товаров
        const cartCounter = document.querySelector('.shopping-cart .counter');
        if (cartCounter) {
            cartCounter.textContent = '0';
        }

        // Переинициализируем обработчики событий
        if (typeof cartData === 'function') {
            cartData();
        }
    }

    // Функция закрытия модального окна
    function closeModal() {
        console.log('Closing modal');
        if (deliveryModal) {
            deliveryModal.classList.remove('active');
        }
        resetCartState();
    }

    // Обработчик кнопки "Оформить заказ"
    if (orderButton) {
        orderButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (deliveryModal) {
                deliveryModal.classList.add('active');
                // Инициализируем карту при открытии модального окна
                if (typeof ymaps !== 'undefined') {
                    initMap();
                    updatePickupPoints(currentCity);
                }
                // Сбрасываем состояние кнопки и сообщения
                confirmButton.disabled = true;
            }
        });
    }

    // Обработчик выбора способа доставки
    deliveryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            // Убираем активный класс у всех опций
            deliveryOptions.forEach(opt => opt.classList.remove('active'));
            // Добавляем активный класс выбранной опции
            option.classList.add('active');
            
            // Показываем соответствующую форму
            const deliveryType = option.querySelector('input').value;
            if (deliveryType === 'courier') {
                courierForm.classList.add('active');
                pickupForm.classList.remove('active');
            } else {
                pickupForm.classList.add('active');
                courierForm.classList.remove('active');
                // Инициализируем карту при выборе самовывоза
                if (typeof ymaps !== 'undefined') {
                    initMap();
                    updatePickupPoints(currentCity);
                }
            }
            // Проверяем валидность формы
            checkFormValidity();
        });
    });

    // Обработчик кнопки "Отмена"
    if (cancelButton) {
        cancelButton.addEventListener('click', (e) => {
            console.log('Cancel button clicked');
            e.preventDefault();
            closeModal();
        });
    }

    // Обработчик кнопки "Заказать"
    if (confirmButton) {
        confirmButton.addEventListener('click', (e) => {
            console.log('Confirm button clicked');
            e.preventDefault();
            const activeOption = document.querySelector('.delivery-option.active');
            if (!activeOption) {
                alert('Пожалуйста, выберите способ доставки');
                return;
            }

            const deliveryType = activeOption.querySelector('input').value;
            let isValid = false;

            if (deliveryType === 'courier') {
                isValid = validateCourierForm();
            } else {
                const pickupSelect = pickupForm.querySelector('select:last-child');
                if (!pickupSelect.value) {
                    alert('Пожалуйста, выберите пункт выдачи');
                    return;
                }
                isValid = true;
            }

            if (isValid) {
                console.log('Form is valid, proceeding with order');
                // Скрываем кнопки
                if (deliveryButtons) {
                    deliveryButtons.style.display = 'none';
                }

                // Сначала очищаем корзину и закрываем модальное окно
                clearCart();
                closeModal();
                
                // Ждем небольшую паузу перед показом сообщения
                setTimeout(() => {
                    console.log('Creating success message');
                    // Создаем и показываем сообщение об успешном заказе
                    const successMessage = document.createElement('div');
                    successMessage.className = 'order-success';
                    successMessage.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 99999;
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 0 20px rgba(0,0,0,0.3);
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        text-align: center;
                        min-width: 300px;
                        max-width: 90%;
                        margin: 20px;
                        border: 2px solid #4fb3bf;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    `;
                    successMessage.innerHTML = '<p>Заказ принят в обработку</p>';
                    
                    // Проверяем, существует ли уже сообщение
                    const existingMessage = document.querySelector('.order-success');
                    if (existingMessage) {
                        existingMessage.remove();
                    }
                    
                    // Добавляем сообщение в контейнер системных сообщений
                    const systemMessages = document.getElementById('system-messages');
                    if (systemMessages) {
                        systemMessages.appendChild(successMessage);
                        console.log('Сообщение добавлено в system-messages');
                    } else {
                        // Если контейнер не найден, добавляем в body
                        document.body.insertBefore(successMessage, document.body.firstChild);
                        console.log('Контейнер system-messages не найден, сообщение добавлено в body');
                    }
                    
                    // Проверяем, что сообщение действительно добавлено
                    const messageAdded = document.querySelector('.order-success');
                    if (messageAdded) {
                        console.log('Сообщение успешно добавлено в DOM');
                        // Принудительно обновляем стили
                        messageAdded.style.display = 'block';
                        messageAdded.style.visibility = 'visible';
                        messageAdded.style.opacity = '1';
                        
                        // Добавляем анимацию появления
                        messageAdded.style.transition = 'opacity 0.3s ease-in-out';
                        setTimeout(() => {
                            messageAdded.style.opacity = '1';
                        }, 50);
                    } else {
                        console.error('Ошибка: сообщение не было добавлено в DOM');
                    }

                    // Ждем 5 секунд перед удалением сообщения
                    setTimeout(() => {
                        console.log('Время вышло, отключение сообщения');
                        if (messageAdded) {
                            // Добавляем анимацию исчезновения
                            messageAdded.style.opacity = '0';
                            setTimeout(() => {
                                messageAdded.remove();
                                console.log('Сообщение убрано');
                                // Сбрасываем состояние корзины
                                resetCartState();
                            }, 300);
                        }
                    }, 1500);
                }, 300); // Небольшая пауза перед показом сообщения
            }
        });
    }

    // Функция валидации формы курьерской доставки
    function validateCourierForm(silent = false) {
        const inputs = courierForm.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                if (!silent) {
                    input.style.borderColor = 'red';
                }
            } else {
                input.style.borderColor = '';
            }
        });

        if (!isValid && !silent) {
            alert('Пожалуйста, заполните все поля адреса');
        }

        return isValid;
    }

    // Функция валидации формы самовывоза
    function validatePickupForm(silent = false) {
        const pickupSelect = pickupForm.querySelector('select:last-child');
        
        if (!pickupSelect.value) {
            if (!silent) {
                pickupSelect.style.borderColor = 'red';
                alert('Пожалуйста, выберите пункт выдачи');
            }
            return false;
        }
        
        pickupSelect.style.borderColor = '';
        return true;
    }

    // Добавляем обработчик клика по оверлею
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delivery-modal')) {
            closeModal();
        }
    });

    // Инициализация
    createCityDatalist();
    setupCitySelects();
    setupFormListeners();

    // Инициализация обработчиков корзины
    if (hasAllElements()) {
        console.log('Cart elements found, setting up handlers...');
        
        // Удаляем старые обработчики
        openCartBtn.removeEventListener('click', handleOpenCart);
        closeCartEl.forEach(item => {
            item.removeEventListener('click', handleCloseCart);
        });

        // Добавляем новые обработчики
        openCartBtn.addEventListener('click', handleOpenCart);
        closeCartEl.forEach(item => {
            item.addEventListener('click', handleCloseCart);
        });

        // Добавляем обработчик для оверлея
        overlay.addEventListener('click', handleCloseCart);
    } else {
        console.error('Not all cart elements found:', {
            cart: !!cart,
            overlay: !!overlay,
            openCartBtn: !!openCartBtn,
            closeCartEl: closeCartEl.length
        });
    }
}); 
