// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initLanguage();
    initTheme();
    initNavigation();
    initCurrencyData();
    initGoldCharts();
    initCurrencyChart();
    initNewsTicker();
    
    // Simulate live data updates
    setInterval(updateCurrencyData, 30000); // Update every 30 seconds
    setInterval(updateGoldPrices, 60000); // Update every minute
});

// Language Toggle Functionality
function initLanguage() {
    const langEnBtn = document.getElementById('lang-en');
    const langFaBtn = document.getElementById('lang-fa');
    
    langEnBtn.addEventListener('click', function() {
        setLanguage('en');
    });
    
    langFaBtn.addEventListener('click', function() {
        setLanguage('fa');
    });
    
    // Check for saved language preference
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
}

function setLanguage(lang) {
    // Update UI elements
    document.querySelectorAll('[data-lang]').forEach(element => {
        if (element.getAttribute('data-lang') === lang) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Update active button
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-fa').classList.toggle('active', lang === 'fa');
    
    // Set document direction
    document.body.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    
    // Save preference
    localStorage.setItem('language', lang);
}

// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-theme', this.checked);
        localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });
}

// Navigation Tabs
function initNavigation() {
    const navItems = document.querySelectorAll('nav li');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active nav item
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Currency Data
function initCurrencyData() {
    // Initial data load
    updateCurrencyData();
}

function updateCurrencyData() {
    // Simulate API call with mock data
    const currencies = [
        {
            code: 'USD',
            name: 'US Dollar',
            nameFa: 'دالر امریکایی',
            flag: 'https://flagcdn.com/w20/us.png',
            rate: 72.50,
            change: 0.5,
            history: [72.1, 72.3, 72.0, 72.4, 72.6, 72.5]
        },
        {
            code: 'EUR',
            name: 'Euro',
            nameFa: 'یورو',
            flag: 'https://flagcdn.com/w20/eu.png',
            rate: 85.20,
            change: -0.3,
            history: [85.5, 85.3, 85.0, 85.2, 85.1, 85.2]
        },
        {
            code: 'GBP',
            name: 'British Pound',
            nameFa: 'پوند انگلیس',
            flag: 'https://flagcdn.com/w20/gb.png',
            rate: 98.75,
            change: 1.2,
            history: [97.5, 97.8, 98.0, 98.5, 98.7, 98.75]
        },
        {
            code: 'PKR',
            name: 'Pakistani Rupee',
            nameFa: 'روپیه پاکستان',
            flag: 'https://flagcdn.com/w20/pk.png',
            rate: 0.45,
            change: 0.0,
            history: [0.45, 0.45, 0.44, 0.45, 0.45, 0.45]
        },
        {
            code: 'IRR',
            name: 'Iranian Rial',
            nameFa: 'ریال ایران',
            flag: 'https://flagcdn.com/w20/ir.png',
            rate: 0.0017,
            change: -0.1,
            history: [0.0017, 0.0017, 0.0018, 0.0017, 0.0017, 0.0017]
        },
        {
            code: 'AED',
            name: 'UAE Dirham',
            nameFa: 'درهم امارات',
            flag: 'https://flagcdn.com/w20/ae.png',
            rate: 19.75,
            change: 0.2,
            history: [19.7, 19.6, 19.7, 19.8, 19.7, 19.75]
        }
    ];
    
    // Get current language
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Update the table
    const tableBody = document.getElementById('currency-data');
    tableBody.innerHTML = '';
    
    currencies.forEach(currency => {
        const row = document.createElement('tr');
        
        // Determine change color
        const changeClass = currency.change >= 0 ? 'positive' : 'negative';
        const changeSymbol = currency.change >= 0 ? '+' : '';
        
        // Create chart sparkline
        const sparkline = document.createElement('div');
        sparkline.className = 'sparkline';
        sparkline.style.height = '30px';
        sparkline.style.width = '80px';
        
        row.innerHTML = `
            <td>
                <div class="currency-name">
                    <img src="${currency.flag}" alt="${currency.code}" class="currency-flag">
                    <span data-lang="en">${currency.name}</span>
                    <span data-lang="fa" style="display:none">${currency.nameFa}</span>
                </div>
            </td>
            <td>${currency.rate.toFixed(2)} AFN</td>
            <td><span class="${changeClass}">${changeSymbol}${currency.change.toFixed(1)}%</span></td>
            <td><div class="sparkline" id="sparkline-${currency.code}"></div></td>
        `;
        
        tableBody.appendChild(row);
        
        // Create sparkline chart
        createSparklineChart(`sparkline-${currency.code}`, currency.history, changeClass);
    });
    
    // Update timestamp
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleTimeString();
    document.getElementById('update-time-fa').textContent = now.toLocaleTimeString('fa-IR');
}

function createSparklineChart(elementId, data, colorClass) {
    const ctx = document.getElementById(elementId);
    
    // Simple sparkline using divs
    ctx.innerHTML = '';
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal;
    
    data.forEach(value => {
        const bar = document.createElement('div');
        bar.style.height = `${((value - minVal) / range) * 100}%`;
        bar.style.width = '6px';
        bar.style.backgroundColor = colorClass === 'positive' ? '#4cc9f0' : '#f72585';
        bar.style.marginRight = '2px';
        bar.style.display = 'inline-block';
        bar.style.borderRadius = '3px';
        ctx.appendChild(bar);
    });
}

// Gold Price Charts
function initGoldCharts() {
    // 24K Gold Chart
    const goldCtx = document.getElementById('goldChart').getContext('2d');
    new Chart(goldCtx, {
        type: 'line',
        data: {
            labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'],
            datasets: [{
                label: '24K Gold Price',
                data: [1948, 1949, 1947, 1950, 1951, 1950, 1950.25],
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: getChartOptions('Gold Price (USD)')
    });
    
    // 22K Gold Chart
    const gold22kCtx = document.getElementById('goldChart22k').getContext('2d');
    new Chart(gold22kCtx, {
        type: 'line',
        data: {
            labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'],
            datasets: [{
                label: '22K Gold Price',
                data: [1790, 1791, 1792, 1788, 1789, 1790, 1789.5],
                borderColor: '#C0C0C0',
                backgroundColor: 'rgba(192, 192, 192, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: getChartOptions('Gold Price (USD)')
    });
}

// Currency History Chart
function initCurrencyChart() {
    const ctx = document.getElementById('currencyChart').getContext('2d');
    window.currencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 6', 'Day 5', 'Day 4', 'Day 3', 'Day 2', 'Yesterday', 'Today'],
            datasets: [{
                label: 'USD to AFN',
                data: [72.1, 72.3, 72.0, 72.4, 72.6, 72.5, 72.5],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: getChartOptions('Exchange Rate (AFN)')
    });
    
    // Add event listeners to chart controls
    document.getElementById('chart-currency-select').addEventListener('change', function() {
        updateCurrencyChart();
    });
    
    document.getElementById('chart-period-select').addEventListener('change', function() {
        updateCurrencyChart();
    });
}

function updateCurrencyChart() {
    const currency = document.getElementById('chart-currency-select').value;
    const period = document.getElementById('chart-period-select').value;
    
    // Simulate different data based on selection
    let labels, data;
    
    if (period === '7d') {
        labels = ['Day 6', 'Day 5', 'Day 4', 'Day 3', 'Day 2', 'Yesterday', 'Today'];
    } else if (period === '30d') {
        labels = Array.from({length: 30}, (_, i) => `Day ${30 - i}`);
    } else {
        labels = Array.from({length: 90}, (_, i) => `Day ${90 - i}`);
    }
    
    // Generate random data based on currency
    const baseValue = {
        'USD': 72, 'EUR': 85, 'PKR': 0.45, 'IRR': 0.0017
    }[currency];
    
    data = labels.map((_, i) => {
        const progress = i / labels.length;
        return baseValue * (0.95 + 0.1 * Math.sin(progress * Math.PI * 4));
    });
    
    // Update chart
    window.currencyChart.data.labels = labels;
    window.currencyChart.data.datasets[0].data = data;
    window.currencyChart.data.datasets[0].label = `${currency} to AFN`;
    window.currencyChart.update();
}

function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        elements: {
            point: {
                radius: 0
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };
}

// News Ticker
function initNewsTicker() {
    const newsItems = document.querySelectorAll('.news-item');
    let currentIndex = 0;
    
    // Show first news item
    if (newsItems.length > 0) {
        newsItems[0].classList.add('active');
    }
    
    // Navigation buttons
    document.getElementById('prev-news').addEventListener('click', function() {
        newsItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex - 1 + newsItems.length) % newsItems.length;
        newsItems[currentIndex].classList.add('active');
    });
    
    document.getElementById('next-news').addEventListener('click', function() {
        newsItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % newsItems.length;
        newsItems[currentIndex].classList.add('active');
    });
    
    // Auto-advance news
    setInterval(function() {
        newsItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % newsItems.length;
        newsItems[currentIndex].classList.add('active');
    }, 10000);
}

// Simulate gold price updates
function updateGoldPrices() {
    // Random price fluctuation
    const gold24kElement = document.querySelector('.gold-price .price');
    const currentPrice = parseFloat(gold24kElement.textContent.replace(/[^0-9.]/g, ''));
    const change = (Math.random() - 0.5) * 10;
    const newPrice = currentPrice + change;
    
    // Update display
    gold24kElement.textContent = `$${newPrice.toFixed(2)}`;
    
    // Update change indicator
    const changeElement = document.querySelector('.gold-price .change');
    const changePercent = (change / currentPrice * 100).toFixed(1);
    
    if (change >= 0) {
        changeElement.textContent = `+${changePercent}%`;
        changeElement.className = 'change positive';
        document.querySelector('.gold-price i').style.color = 'green';
        document.querySelector('.gold-price i').className = 'fas fa-chevron-up';
    } else {
        changeElement.textContent = `${changePercent}%`;
        changeElement.className = 'change negative';
        document.querySelector('.gold-price i').style.color = 'red';
        document.querySelector('.gold-price i').className = 'fas fa-chevron-down';
    }
    
    // Update timestamp
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleTimeString();
    document.getElementById('update-time-fa').textContent = now.toLocaleTimeString('fa-IR');
}
// ذخیره قیمت‌های دستی
function saveManualRates(rates) {
    localStorage.setItem('manualRates', JSON.stringify(rates));
}

// دریافت قیمت‌های ذخیره شده
function getManualRates() {
    return JSON.parse(localStorage.getItem('manualRates')) || [];
}
// محاسبه درصد تغییرات نسبت به روز قبل
function calculateChanges(currencies) {
    currencies.forEach(currency => {
        const yesterdayRate = currency.history[currency.history.length - 2]; // قیمت دیروز
        const todayRate = currency.rate; // قیمت امروز (دستی تنظیم شده)
        currency.change = ((todayRate - yesterdayRate) / yesterdayRate * 100).toFixed(2);
    });
    return currencies;
}
document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const messageDiv = document.querySelector('.thank-you-message');
  
  // نمایش وضعیت
  messageDiv.textContent = 'در حال ارسال پیام...';
  messageDiv.style.display = 'block';
  messageDiv.style.background = 'rgba(255, 193, 7, 0.2)';

  try {
    // استفاده از API جدید FormSubmit
    const response = await fetch('https://formsubmit.co/ajax/nematnoorzai558@gmail.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });

    const data = await response.json();
    
    if (data.success) {
      messageDiv.textContent = 'پیام با موفقیت ارسال شد!';
      messageDiv.style.background = 'rgba(46, 204, 113, 0.2)';
      form.reset();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    messageDiv.textContent = 'خطا در ارسال: ' + error.message;
    messageDiv.style.background = 'rgba(231, 76, 60, 0.2)';
    console.error('Error:', error);
  }

  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
});
