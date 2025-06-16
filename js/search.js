import products from './products.js';
import { paginate } from './modules/pagination.js';

// Инициализация элементов после загрузки DOM
function initializeElements() {
    console.log('Инициализация элементов...');
    
    const searchInput = document.querySelector('#elastic');
    const productsList = document.querySelector('.js-products-list');
    const filterButtons = document.querySelectorAll('.js-series-item');
    const priceSelect = document.querySelector('.js-filter-price-select');
    const priceInputs = document.querySelectorAll('.js-filter-price-input');

    console.log('Найдены элементы:', {
        searchInput: !!searchInput,
        productsList: !!productsList,
        filterButtons: filterButtons.length,
        priceSelect: !!priceSelect,
        priceInputs: priceInputs.length
    });

    return {
        searchInput,
        productsList,
        filterButtons,
        priceSelect,
        priceInputs
    };
}

let elements = null;
let currentGenre = 'all';
let currentSearchQuery = '';
let currentSortOrder = 'default';
let priceRange = {
    min: 0,
    max: Infinity
};

// Функция для получения параметров из URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Функция для активации фильтра по жанру из URL
function activateGenreFilter() {
    const genre = getUrlParameter('genre');
    console.log('Жанр из URL:', genre);
    
    if (genre && elements.filterButtons) {
        // Находим кнопку с соответствующим жанром
        const genreButton = Array.from(elements.filterButtons).find(button => 
            button.textContent === genre
        );
        console.log('Найдена кнопка жанра:', genreButton?.textContent);
        
        if (genreButton) {
            elements.filterButtons.forEach(btn => btn.classList.remove('active'));
            genreButton.classList.add('active');
            currentGenre = genre;
            console.log('Установлен текущий жанр:', currentGenre);
            filterProducts(); // Вызываем фильтрацию сразу после установки жанра
        }
    }
}

function renderProducts(filteredProducts) {
    console.log('Отрисовка продуктов:', filteredProducts.length);
    if (!elements.productsList) {
        console.error('Не найден список продуктов');
        return;
    }
    
    // Вместо прямой отрисовки используем пагинацию
    paginate(filteredProducts);
}

function filterProducts() {
    console.log('Начало фильтрации. Текущий жанр:', currentGenre);
    let filteredProducts = products;

    // Фильтрация по жанру
    if (currentGenre !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
            const match = product.genre === currentGenre;
            console.log(`Проверка продукта ${product.name}: жанр ${product.genre} === ${currentGenre} ? ${match}`);
            return match;
        });
    }

    // Фильтрация по поисковому запросу
    if (currentSearchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(currentSearchQuery.toLowerCase())
        );
    }

    // Фильтрация по цене
    filteredProducts = filteredProducts.filter(product => {
        const price = parseInt(product.prices[0]);
        return price >= priceRange.min && price <= priceRange.max;
    });

    // Сортировка по цене
    if (currentSortOrder !== 'default') {
        filteredProducts.sort((a, b) => {
            const priceA = parseInt(a.prices[0]);
            const priceB = parseInt(b.prices[0]);
            return currentSortOrder === 'asc' ? priceA - priceB : priceB - priceA;
        });
    }

    console.log('Результат фильтрации:', filteredProducts.length, 'продуктов');
    renderProducts(filteredProducts);
}

function initializeEventListeners() {
    console.log('Инициализация обработчиков событий...');
    
    // Обработчик фильтров по жанрам
    elements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Клик по кнопке жанра:', button.textContent);
            // Убираем активный класс у всех кнопок
            elements.filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            button.classList.add('active');
            
            // Обновляем текущий жанр
            currentGenre = button.textContent === 'Все' ? 'all' : button.textContent;
            console.log('Установлен жанр после клика:', currentGenre);
            
            filterProducts();
        });
    });

    // Обработчик поискового ввода
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            filterProducts();
        });
    }

    // Обработчик сортировки по цене
    if (elements.priceSelect) {
        elements.priceSelect.addEventListener('change', (e) => {
            currentSortOrder = e.target.value;
            filterProducts();
        });
    }

    // Обработчик фильтрации по диапазону цен
    if (elements.priceInputs.length) {
        elements.priceInputs.forEach(input => {
            input.addEventListener('input', () => {
                const minInput = elements.priceInputs[0];
                const maxInput = elements.priceInputs[1];
                
                priceRange.min = parseInt(minInput.value) || 0;
                priceRange.max = parseInt(maxInput.value) || Infinity;
                
                filterProducts();
            });
        });
    }
}

// Инициализация при загрузке страницы
console.log('Начало инициализации страницы');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded сработал');
    elements = initializeElements();
    if (elements.filterButtons.length && elements.productsList) {
        initializeEventListeners();
        activateGenreFilter();
        filterProducts(); // Показываем все продукты при начальной загрузке
    } else {
        console.error('Не удалось найти необходимые элементы на странице');
    }
});