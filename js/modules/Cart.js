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

const openCart = () => {
    if (!hasAllElements()) return;
    
    openCartBtn.addEventListener('click', () => {
        toggleCart(true);
    });
};

const closeCart = () => {
    if (!hasAllElements()) return;
    
    closeCartEl.forEach((item) => {
        item.addEventListener('click', () => {
            toggleCart(false);
        })
    })
};

export {
    openCart,
    closeCart
};