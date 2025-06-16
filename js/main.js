import products from './products.js';
import { renderProductCards } from './modules/productCards.js';
import { paginate } from './modules/pagination.js';
import { closeCart, openCart } from './modules/Cart.js';
import { cartData } from './modules/CartData.js';
import { openDeliveryModal } from './cart.js';

// Функция для добавления товара в корзину
export function addToCart(product) {
    cart.addItem(product);
}

// Функция для получения текущего состояния корзины
export function getCartItems() {
    return cart.items;
}

// Функция для проверки, находимся ли мы на странице каталога
function isCatalogPage() {
    return !!document.querySelector('.js-products-list');
}

window.addEventListener('DOMContentLoaded', () => {
    // Инициализируем корзину только на странице каталога
    if (isCatalogPage()) {
        openCart();
        closeCart();
        cartData();
    }
});

