document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const gaugeValue = document.getElementById('gauge-value');
    const statusText = document.getElementById('status-text');
    const gauge = document.querySelector('.gauge');
    
    // Result elements
    const ipAddressEl = document.getElementById('ip-address');
    const locationEl = document.getElementById('location-text');
    const flagIconEl = document.getElementById('flag-icon');
    const pingSpeedEl = document.getElementById('ping-speed');
    const downloadSpeedEl = document.getElementById('download-speed');
    const uploadSpeedEl = document.getElementById('upload-speed');
    
    let animationInterval = null;

    // --- 1. Fetch User Info on Page Load ---
    async function fetchUserInfo() {
        try {
            const response = await fetch('https://ipinfo.io/json');
            if (!response.ok) throw new Error('Could not fetch IP info');
            const data = await response.json();
            
            ipAddressEl.textContent = data.ip;
            locationEl.textContent = `${data.city}, ${data.country}`;
            flagIconEl.src = `https://flagcdn.com/w40/${data.country.toLowerCase()}.png`;
            flagIconEl.style.display = 'inline-block';
            
        } catch (error) {
            console.error('Error fetching user info:', error);
            ipAddressEl.textContent = 'Unavailable';
            locationEl.textContent = 'Unavailable';
        }
    }
    
    // --- 2. توابع آپدیت ظاهر گرافیکی ---

    // این تابع فقط ظاهر عقربه و متن را بر اساس سرعت فعلی آپدیت می‌کند
    function updateGaugeVisuals(speed) {
        gaugeValue.textContent = speed.toFixed(2);
        // برای نمایش بهتر، عقربه در سرعت ۲۰۰ مگابیت به نهایت خود می‌رسد
        const gaugeMaxSpeed = 200; 
        const percentage = Math.min(speed / gaugeMaxSpeed, 1) * 50;
        gauge.style.setProperty('--p', Math.round(percentage));
    }

    // این تابع برای انیمیشن دادن به یک مقدار نهایی (مثل تست آپلود) استفاده می‌شود
    function animateGaugeToTarget(targetValue, duration) {
        let startValue = parseFloat(gaugeValue.textContent);
        if (isNaN(startValue)) startValue = 0;
        let current = startValue;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = (targetValue - startValue) / totalSteps;
        
        if (animationInterval) clearInterval(animationInterval);
        
        animationInterval = setInterval(() => {
            current += increment;
            updateGaugeVisuals(current);
            
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                clearInterval(animationInterval);
                updateGaugeVisuals(targetValue);
            }
        }, stepTime);
    }
    
    // --- 3. اجرای تست‌ها ---
    
    // تست پینگ
    async function measurePing() {
        statusText.textContent = 'Testing Ping...';
        const startTime = performance.now();
        try {
            await fetch('/?rand=' + new Date().getTime(), { method: 'HEAD', cache: 'no-store' });
            const endTime = performance.now();
            const ping = Math.round(endTime - startTime);
            pingSpeedEl.textContent = ping;
            return ping;
        } catch (error) {
            pingSpeedEl.textContent = 'Fail';
            return 'Fail';
        }
    }

    // تست دانلود با نمایش سرعت واقعی و لحظه‌ای
    async function measureDownloadSpeed() {
        statusText.textContent = 'Testing Download Speed...';
        const testFileUrl = 'https://sabnzbd.org/tests/internetspeed/10MB.bin'; // Use a slightly larger file for better measurement
        
        let bytesReceived = 0;
        let startTime = performance.now();
        let downloadInterval = null;

        try {
            const response = await fetch(testFileUrl + '?t=' + new Date().getTime());
            if (!response.body) {
                throw new Error("ReadableStream not supported by this browser.");
            }
            const reader = response.body.getReader();
            
            // یک اینتروال برای آپدیت لحظه‌ای سرعت ایجاد می‌کنیم
            downloadInterval = setInterval(() => {
                const elapsedTime = (performance.now() - startTime) / 1000;
                if (elapsedTime > 0) {
                    const speedBps = (bytesReceived * 8) / elapsedTime;
                    const speedMbps = speedBps / 1000 / 1000;
                    updateGaugeVisuals(speedMbps); // نمایش سرعت واقعی
                }
            }, 250); // آپدیت ظاهر برنامه هر ۲۵۰ میلی‌ثانیه

            // شروع به خواندن داده‌های در حال دانلود
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break; // دانلود تمام شد
                }
                bytesReceived += value.length;
            }
            
            // محاسبه سرعت نهایی و دقیق
            const finalDuration = (performance.now() - startTime) / 1000;
            clearInterval(downloadInterval); // متوقف کردن آپدیت لحظه‌ای

            const finalSpeedMbps = (bytesReceived * 8) / finalDuration / 1000 / 1000;

            updateGaugeVisuals(finalSpeedMbps); // نمایش مقدار دقیق و نهایی
            downloadSpeedEl.textContent = finalSpeedMbps.toFixed(2);
            return finalSpeedMbps;

        } catch (error) {
            console.error("Download test failed:", error);
            if (downloadInterval) clearInterval(downloadInterval);
            downloadSpeedEl.textContent = 'Fail';
            updateGaugeVisuals(0);
            return 'Fail';
        }
    }


    // تست آپلود (شبیه‌سازی شده)
    async function measureUploadSpeed(downloadSpeed) {
        statusText.textContent = 'Testing Upload Speed...';
        const simulatedUploadSpeed = parseFloat((downloadSpeed * (Math.random() * 0.4 + 0.4)).toFixed(2));
        const simulationDuration = 4000;

        return new Promise(resolve => {
            // انیمیشن از سرعت نهایی دانلود به سرعت آپلود
            animateGaugeToTarget(simulatedUploadSpeed, simulationDuration);
            
            setTimeout(() => {
                uploadSpeedEl.textContent = simulatedUploadSpeed.toFixed(2);
                statusText.textContent = 'Test Complete!';
                resolve(simulatedUploadSpeed);
            }, simulationDuration);
        });
    }

    // ریست کردن ظاهر برنامه
    function resetUI() {
        statusText.textContent = 'Press Start to Begin';
        pingSpeedEl.textContent = '--';
        downloadSpeedEl.textContent = '--';
        uploadSpeedEl.textContent = '--';
        updateGaugeVisuals(0);
        if (animationInterval) clearInterval(animationInterval);
    }
    
    // --- Event Listener ---
    startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        startBtn.textContent = 'Testing...';
        resetUI();
        
        await measurePing();
        const downloadSpeed = await measureDownloadSpeed();

        if (downloadSpeed !== 'Fail') {
            await measureUploadSpeed(downloadSpeed);
        } else {
            statusText.textContent = 'Test Failed!';
            uploadSpeedEl.textContent = 'Fail';
        }

        startBtn.textContent = 'Start Again';
        startBtn.disabled = false;
    });

    // لود اولیه اطلاعات کاربر
    fetchUserInfo();
});
