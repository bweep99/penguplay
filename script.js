document.addEventListener("DOMContentLoaded", () => {
    // !!! GANTI DENGAN URL WEB APP TERBARUMU !!!
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwZJx4OLRyU848FKqaC76_BVURH35xj58RWrr2fxD06YQbx2OII54QoClXJ9L0HdG-Z/exec'; 
    const pageType = document.body.getAttribute('data-page');

    // --- SIDEBAR & NAV LOGIC ---
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
        closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));
    }
    document.querySelectorAll('.logout').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); localStorage.clear(); window.location.href = 'index.html'; });
    });

    window.togglePassword = function(id, iconEl) {
        const input = document.getElementById(id);
        if (input.type === "password") { input.type = "text"; iconEl.classList.remove('fa-eye'); iconEl.classList.add('fa-eye-slash'); } 
        else { input.type = "password"; iconEl.classList.remove('fa-eye-slash'); iconEl.classList.add('fa-eye'); }
    };

    // --- PFP REGISTRATION UPLOAD COMPRESSOR ---
    const avatarInputForm = document.getElementById('avatar');
    const avatarPreviewForm = document.getElementById('avatarPreview');
    const avatarBase64Form = document.getElementById('avatarBase64');
    if(avatarInputForm) {
        avatarInputForm.addEventListener('change', function(e){
            const file = e.target.files[0]; if(!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                    canvas.width = 100; canvas.height = 100;
                    ctx.fillStyle = "white"; ctx.fillRect(0, 0, 100, 100); 
                    ctx.drawImage(img, 0, 0, 100, 100);
                    const b64 = canvas.toDataURL('image/jpeg', 0.6);
                    avatarPreviewForm.src = b64; avatarBase64Form.value = b64;
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // --- AUTH LOGIC (LOGIN / REG) ---
    if (pageType === 'login') {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault(); const btn = loginForm.querySelector('button'); btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
                const fd = new FormData(); fd.append('action', 'login'); fd.append('email', document.getElementById('email').value); fd.append('password', document.getElementById('password').value);
                fetch(scriptURL, { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
                    if(d.status==='success'){
                        btn.style.background = "#22c55e"; btn.innerHTML = '<i class="fa-solid fa-check"></i> Success!';
                        localStorage.setItem('p_user', d.username); localStorage.setItem('p_email', d.email); localStorage.setItem('p_score', d.score);
                        localStorage.setItem('p_dob', d.dob); localStorage.setItem('p_faction', d.faction); localStorage.setItem('p_avatar', d.avatar || "");
                        setTimeout(() => window.location.href = 'home.html', 800);
                    } else { alert(d.message); btn.innerHTML = 'Login to Play <i class="fa-solid fa-arrow-right"></i>'; btn.disabled = false; }
                });
            });
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault(); const btn = registerForm.querySelector('button'); btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Hatching...';
                const fd = new FormData(); fd.append('action', 'register'); fd.append('username', document.getElementById('username').value); fd.append('email', document.getElementById('reg-email').value); fd.append('password', document.getElementById('reg-password').value); fd.append('dob', document.getElementById('dob').value); fd.append('faction', document.getElementById('faction').value); fd.append('difficulty', document.querySelector('input[name="difficulty"]:checked').value); fd.append('terms', document.getElementById('terms').checked ? "Yes" : "No");
                fd.append('avatar', document.getElementById('avatarBase64')?.value || "");
                fetch(scriptURL, { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
                    if(d.status==='success'){ btn.innerHTML = '<i class="fa-solid fa-check"></i> Welcome!'; btn.style.background = "#22c55e"; setTimeout(() => window.location.href = 'index.html', 1000); } 
                    else { alert("Failed"); btn.innerHTML = 'Register Now'; btn.disabled = false; }
                });
            });
        }
    }

    if (['home', 'profile', 'about', 'contact'].includes(pageType)) {
        if (!localStorage.getItem('p_user')) { window.location.href = 'index.html'; return; }
    }

    // --- PROFILE PAGE LOGIC (EDIT PFP) ---
    if (pageType === 'profile') {
        document.getElementById('userName').innerText = localStorage.getItem('p_user');
        document.getElementById('userEmail').innerText = localStorage.getItem('p_email');
        const rawDob = localStorage.getItem('p_dob'); document.getElementById('userDob').innerText = rawDob ? new Date(rawDob).toLocaleDateString() : "Unknown";
        document.getElementById('userRegion').innerText = (localStorage.getItem('p_faction') || "Unknown").toUpperCase();
        document.getElementById('userScore').innerText = localStorage.getItem('p_score');
        
        const avatarStr = localStorage.getItem('p_avatar');
        const avatarImg = document.getElementById('userAvatar');
        if(avatarStr && avatarStr.length > 50) { avatarImg.src = avatarStr; }

        const editInput = document.getElementById('editAvatarInput');
        const saveBtn = document.getElementById('saveAvatarBtn');
        let newAvatarBase64 = "";

        if(editInput) {
            editInput.addEventListener('change', function(e) {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                        canvas.width = 150; canvas.height = 150; ctx.fillStyle = "white"; ctx.fillRect(0,0,150,150);
                        ctx.drawImage(img, 0, 0, 150, 150);
                        newAvatarBase64 = canvas.toDataURL('image/jpeg', 0.6);
                        avatarImg.src = newAvatarBase64; saveBtn.style.display = "inline-block";
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            });
            saveBtn.addEventListener('click', () => {
                saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; saveBtn.disabled = true;
                const fd = new FormData(); fd.append('action', 'updateAvatar'); fd.append('email', localStorage.getItem('p_email')); fd.append('avatar', newAvatarBase64);
                fetch(scriptURL, { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
                    if(d.status==='success'){
                        localStorage.setItem('p_avatar', newAvatarBase64); saveBtn.style.background = "#22c55e"; saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
                        setTimeout(() => { saveBtn.style.display = "none"; saveBtn.style.background = "var(--primary)"; saveBtn.disabled = false; }, 2000);
                    }
                });
            });
        }
    }

    if (pageType === 'about' && typeof gsap !== 'undefined') gsap.from(".gs-anim", { y: 50, opacity: 0, duration: 1, stagger: 0.3, ease: "power3.out", delay: 0.2 });
    if (pageType === 'contact') {
        const contactForm = document.getElementById('contactForm');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); const btn = contactForm.querySelector('button'); btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...'; btn.disabled = true;
            const fd = new FormData(); fd.append('action', 'contact'); fd.append('name', document.getElementById('contactName').value); fd.append('email', document.getElementById('contactEmail').value); fd.append('message', document.getElementById('contactMessage').value);
            fetch(scriptURL, { method: 'POST', body: fd }).then(r=>r.json()).then(d=>{
                if(d.status === 'success') {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!'; btn.style.background = "#22c55e"; contactForm.reset();
                    setTimeout(()=> { btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>'; btn.style.background = "var(--primary)"; btn.disabled = false; }, 3000);
                }
            });
        });
    }

    // --- 3D RENDERING ---
    const bgCanvas = document.getElementById('bgCanvas'); const gameCanvas = document.getElementById('gameCanvas');
    if (typeof THREE !== 'undefined') {
        if (bgCanvas) init3DScene(bgCanvas, pageType);
        if (gameCanvas) init3DGame(gameCanvas, scriptURL);
    }
});

// ==========================================
// 3D CORE SYSTEM (MAPS & TERRAINS)
// ==========================================
const mapThemes = {
    ice: { bg: 0x87ceeb, ground: 0xc9f0ff, light: 0xffffff },
    sunset: { bg: 0xff7e67, ground: 0xffd3b6, light: 0xffb6b9 },
    night: { bg: 0x0f172a, ground: 0x1e293b, light: 0x7dd3fc }
};

// !!! BUG YANG MEMBUAT BLACK SCREEN SUDAH DIPERBAIKI DI BAWAH INI (targetGroup vs terrainGroup) !!!
function buildTerrain(type, targetGroup, terrainArray) {
    while(targetGroup.children.length > 0){ 
        const obj = targetGroup.children[0]; targetGroup.remove(obj); 
        if(obj.geometry) obj.geometry.dispose(); if(obj.material) obj.material.dispose();
    }
    terrainArray.length = 0;

    if(type === 'ice') {
        const iceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true });
        for(let i=0; i<15; i++) {
            const size = Math.random() * 3 + 1.5;
            const mesh = Math.random() > 0.5 ? new THREE.Mesh(new THREE.ConeGeometry(size, size*2.5, 5), iceMat) : new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), iceMat);
            mesh.position.set((Math.random()-0.5)*40, size*0.5, (Math.random()-0.5)*40); mesh.castShadow = true; 
            mesh.userData = { radius: size * 0.8 }; 
            targetGroup.add(mesh); // <-- (Diperbaiki)
            terrainArray.push(mesh);
        }
    } else if(type === 'sunset') {
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9, flatShading: true });
        for(let i=0; i<12; i++) {
            const size = Math.random() * 2 + 1;
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size), rockMat);
            rock.position.set((Math.random()-0.5)*40, size*0.5, (Math.random()-0.5)*40); rock.castShadow = true; 
            rock.userData = { radius: size }; 
            targetGroup.add(rock); 
            terrainArray.push(rock);
        }
    } else if(type === 'night') {
        const crystalMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x0088ff, roughness: 0.2 });
        for(let i=0; i<15; i++) {
            const size = Math.random() * 2 + 1;
            const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.5, size*3, 6), crystalMat);
            crystal.position.set((Math.random()-0.5)*40, size*1.5, (Math.random()-0.5)*40); crystal.castShadow = true; 
            crystal.userData = { radius: 1.5 }; 
            targetGroup.add(crystal); 
            terrainArray.push(crystal);
        }
    }
}

// PENGUIN BUILDER (Slider, Waddler & BOSS)
function buildCutePenguin(isBoss = false) {
    const pGroup = new THREE.Group(); const inner = new THREE.Group(); pGroup.add(inner);
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), blackMat); body.scale.set(1, 1.4, 1); body.position.y = 0.8; body.castShadow = true; inner.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), whiteMat); belly.scale.set(1, 1.3, 0.8); belly.position.set(0, 0.75, 0.25); inner.add(belly);
    const fGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const fL = new THREE.Mesh(fGeo, blackMat); fL.scale.set(0.2, 0.8, 0.4); fL.position.set(-0.65, 0.9, 0); fL.rotation.z = Math.PI / 8;
    const fR = new THREE.Mesh(fGeo, blackMat); fR.scale.set(0.2, 0.8, 0.4); fR.position.set(0.65, 0.9, 0); fR.rotation.z = -Math.PI / 8; inner.add(fL, fR);
    const footGeo = new THREE.BoxGeometry(0.3, 0.1, 0.4);
    const footL = new THREE.Mesh(footGeo, orangeMat); footL.position.set(-0.25, 0.05, 0.2); const footR = new THREE.Mesh(footGeo, orangeMat); footR.position.set(0.25, 0.05, 0.2); inner.add(footL, footR);
    
    // Mata & Paruh
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeColor = isBoss ? new THREE.MeshStandardMaterial({ color: 0xff0000 }) : whiteMat;
    const eyeL = new THREE.Mesh(eyeGeo, eyeColor); eyeL.position.set(-0.2, 1.35, 0.5); const eyeR = new THREE.Mesh(eyeGeo, eyeColor); eyeR.position.set(0.2, 1.35, 0.5);
    const pupilGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const pupilL = new THREE.Mesh(pupilGeo, blackMat); pupilL.position.set(-0.2, 1.35, 0.57); const pupilR = new THREE.Mesh(pupilGeo, blackMat); pupilR.position.set(0.2, 1.35, 0.57);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 16), orangeMat); beak.rotation.x = Math.PI / 2; beak.position.set(0, 1.2, 0.65);
    inner.add(eyeL, eyeR, pupilL, pupilR, beak);

    if (isBoss) {
        pGroup.scale.set(2, 2, 2);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 5), new THREE.MeshStandardMaterial({color:0xffd700})); crown.position.y = 1.8; inner.add(crown);
        pGroup.userData = { isBoss: true, hp: 3, flipperL: fL, flipperR: fR, inner };
    } else {
        const isSlider = Math.random() > 0.7; // 30% pinguin meluncur pakai perut!
        if (isSlider) { inner.rotation.x = -Math.PI / 2.2; inner.position.y = -0.3; }
        pGroup.userData = { isSlider: isSlider, flipperL: fL, flipperR: fR, inner };
    }
    return pGroup;
}


// ==========================================
// BACKGROUND SCENE UNTUK MENU
// ==========================================
function init3DScene(canvas, mode) {
    let themeName = 'ice';
    if(mode === 'profile') themeName = 'sunset';
    if(mode === 'about') themeName = 'night';
    if(mode === 'contact') themeName = 'ice';

    const scene = new THREE.Scene(); const theme = mapThemes[themeName];
    scene.background = new THREE.Color(theme.bg); scene.fog = new THREE.FogExp2(theme.bg, 0.02);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7)); const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); dirLight.position.set(10, 20, 10); scene.add(dirLight);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: theme.ground })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    
    const bgTerrainGroup = new THREE.Group(); scene.add(bgTerrainGroup);
    const dummyArray =[]; buildTerrain(themeName, bgTerrainGroup, dummyArray);

    const penguins =[];
    if (mode === 'profile') { let p = buildCutePenguin(); p.position.set(3, 0, 0); p.scale.set(2,2,2); scene.add(p); penguins.push(p); camera.position.set(0, 3, 10); camera.lookAt(3, 2, 0); } 
    else if (mode === 'about') { for(let i=0; i<5; i++){ let p = buildCutePenguin(); p.position.set((Math.random()-0.5)*10, 0, -5 + (Math.random()-0.5)*5); scene.add(p); penguins.push(p); } camera.position.set(0, 5, 12); camera.lookAt(0, 0, -5); } 
    else if (mode === 'contact') { let p = buildCutePenguin(); p.position.set(-5, 0, 2); p.rotation.y = Math.PI/4; scene.add(p); penguins.push(p); camera.position.set(0, 4, 12); camera.lookAt(-2, 2, 0); } 
    else { for(let i=0; i<8; i++){ let p = buildCutePenguin(); p.position.set((Math.random()-0.5)*20, 0, (Math.random()-0.5)*20); p.rotation.y = Math.random()*Math.PI*2; scene.add(p); penguins.push(p); } }

    const clock = new THREE.Clock(); window.addEventListener('resize', () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
    function animate() {
        requestAnimationFrame(animate); const time = clock.getElapsedTime();
        if (mode === 'login') { camera.position.x = Math.sin(time * 0.1) * 25; camera.position.y = 10; camera.position.z = Math.cos(time * 0.1) * 25; camera.lookAt(0, 0, 0); } 
        else if (mode === 'profile') { penguins[0].rotation.y += 0.01; }
        renderer.render(scene, camera);
    }
    animate();
}

// ==========================================
// GAME UTAMA & MEKANIK BOSS & COLLISION
// ==========================================
function init3DGame(canvas, scriptURL) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(mapThemes.ice.bg); scene.fog = new THREE.FogExp2(mapThemes.ice.bg, 0.02);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000); camera.position.set(0, 8, 15); camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(new THREE.AmbientLight(0xffffff, 0.7)); const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); dirLight.position.set(10, 20, 10); dirLight.castShadow = true; scene.add(dirLight);

    const groundMat = new THREE.MeshStandardMaterial({ color: mapThemes.ice.ground, roughness: 0.1 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    const terrainGroup = new THREE.Group(); scene.add(terrainGroup);
    const activeTerrains =[]; buildTerrain('ice', terrainGroup, activeTerrains);

    document.getElementById('mapSelect').addEventListener('change', (e) => {
        const theme = mapThemes[e.target.value];
        gsap.to(scene.background, { r: (theme.bg >> 16 & 255)/255, g: (theme.bg >> 8 & 255)/255, b: (theme.bg & 255)/255, duration: 2 });
        gsap.to(scene.fog.color, { r: (theme.bg >> 16 & 255)/255, g: (theme.bg >> 8 & 255)/255, b: (theme.bg & 255)/255, duration: 2 });
        gsap.to(groundMat.color, { r: (theme.ground >> 16 & 255)/255, g: (theme.ground >> 8 & 255)/255, b: (theme.ground & 255)/255, duration: 2 });
        gsap.to(dirLight.color, { r: (theme.light >> 16 & 255)/255, g: (theme.light >> 8 & 255)/255, b: (theme.light & 255)/255, duration: 2 });
        buildTerrain(e.target.value, terrainGroup, activeTerrains);
    });

    const penguinGroup = new THREE.Group(); scene.add(penguinGroup);
    const penguins =[];
    for(let i=0; i<12; i++) spawnNormalPenguin();

    function spawnNormalPenguin() {
        const p = buildCutePenguin(false); p.position.set((Math.random()-0.5)*30, 0, (Math.random()-0.5)*20 - 5);
        p.userData = { ...p.userData, vx: (Math.random()-0.5)*0.15, vz: (Math.random()-0.5)*0.15, active: true, offset: Math.random()*10 };
        penguinGroup.add(p); penguins.push(p);
    }
    
    function spawnBossPenguin() {
        const boss = buildCutePenguin(true); boss.position.set((Math.random()-0.5)*20, 0, -10);
        boss.userData = { ...boss.userData, vx: (Math.random()-0.5)*0.05, vz: (Math.random()-0.5)*0.05, active: true, offset: 0 };
        penguinGroup.add(boss); penguins.push(boss);
        gsap.from(boss.position, { y: 10, duration: 1, ease: "bounce.out" });
    }

    let score = parseInt(localStorage.getItem('p_score')) || 0; const email = localStorage.getItem('p_email');
    const scoreEl = document.getElementById('scoreVal'); scoreEl.innerText = score; checkAchievements(score, false);
    let clickCounter = 0;

    let saveTimeout;
    function syncScoreToDB(isReset = false) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const fd = new FormData(); fd.append('action', 'updateScore'); fd.append('email', email); fd.append('score', score); if(isReset) fd.append('reset', 'true');
            fetch(scriptURL, { method: 'POST', body: fd });
        }, 2000);
    }

    document.getElementById('resetScoreBtn').addEventListener('click', () => {
        if(confirm("Reset score to 0?")) {
            score = 0; scoreEl.innerText = score; localStorage.setItem('p_score', score);
            document.querySelectorAll('.badge').forEach(b => b.classList.remove('unlocked')); checkAchievements(0, false); syncScoreToDB(true);
        }
    });

    function checkAchievements(currScore, playAnim) {
        const targets =[{s: 50, n: "First Catch"}, {s: 150, n: "Ice Breaker"}, {s: 300, n: "Snow Walker"}, {s: 500, n: "Deep Diver"}, {s: 1000, n: "Arctic Explorer"}];
        let unlocked = 0;
        targets.forEach((t, i) => {
            const badge = document.getElementById(`badge-${i+1}`);
            if (currScore >= t.s) {
                unlocked++;
                if (!badge.classList.contains('unlocked')) {
                    badge.classList.add('unlocked');
                    if (playAnim) {
                        gsap.fromTo(badge, {scale: 0.2, rotation: 360}, {scale: 1, rotation: 0, duration: 1, ease: "back.out(1.5)"});
                        const popup = document.getElementById('achvPopup'); document.getElementById('achvPopupImg').src = badge.src; document.getElementById('achvPopupName').innerText = t.n;
                        popup.classList.add('show'); setTimeout(() => popup.classList.remove('show'), 4000);
                    }
                }
            }
        });
        document.getElementById('achvCount').innerText = unlocked;
    }

    // RAYCASTER (COMBAT)
    const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); let tx = 0, ty = 8;
    window.addEventListener('pointermove', e => { mouse.x = (e.clientX/window.innerWidth)*2-1; mouse.y = -(e.clientY/window.innerHeight)*2+1; tx = mouse.x*5; ty = 8+mouse.y*2; });
    window.addEventListener('pointerdown', e => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(penguinGroup.children, true);
        if (intersects.length > 0) {
            let obj = intersects[0].object; while(obj.parent && obj.parent !== penguinGroup) obj = obj.parent;
            
            if (obj.userData.active) {
                if (obj.userData.isBoss) {
                    obj.userData.hp--;
                    if (obj.userData.hp > 0) {
                        gsap.to(obj.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.1, yoyo: true, repeat: 1 });
                        createHeartParticles(obj.position.clone().add(new THREE.Vector3(0,2,0)), scene, 0xff0000);
                    } else {
                        obj.userData.active = false; score += 50; scoreEl.innerText = score; localStorage.setItem('p_score', score); syncScoreToDB();
                        gsap.fromTo(scoreEl, { scale: 2.5, color: "#ffd700" }, { scale: 1, color: "var(--accent)", duration: 0.8 }); checkAchievements(score, true);
                        createHeartParticles(obj.position.clone().add(new THREE.Vector3(0,2,0)), scene, 0xffd700); 
                        gsap.to(obj.scale, { x:0, y:0, z:0, duration: 0.5, ease: "back.in(1.7)", onComplete: () => { penguinGroup.remove(obj); }});
                    }
                } else {
                    obj.userData.active = false; score += 10; scoreEl.innerText = score; localStorage.setItem('p_score', score); syncScoreToDB();
                    gsap.fromTo(scoreEl, { scale: 1.8 }, { scale: 1, duration: 0.5 }); checkAchievements(score, true);
                    createHeartParticles(obj.position.clone().add(new THREE.Vector3(0,1,0)), scene, 0xff69b4);
                    
                    clickCounter++;
                    if(clickCounter >= 7) { spawnBossPenguin(); clickCounter = 0; }

                    gsap.to(obj.position, { y: 2, duration: 0.3, yoyo: true, repeat: 1 }); gsap.to(obj.rotation, { y: obj.rotation.y + Math.PI*2, duration: 0.6 });
                    gsap.to(obj.scale, { x:0, y:0, z:0, duration: 0.3, delay: 0.4, ease: "back.in(1.7)", onComplete: () => {
                        obj.position.set((Math.random()-0.5)*30, 0, (Math.random()-0.5)*20-5); gsap.to(obj.scale, { x:1, y:1, z:1, duration:0.5, ease: "elastic.out(1,0.3)" }); obj.userData.active = true;
                    }});
                }
            }
        }
    });

    const particles =[];
    function createHeartParticles(pos, sceneRef, hexColor) {
        const mat = new THREE.MeshBasicMaterial({ color: hexColor }); const geo = new THREE.SphereGeometry(0.2, 8, 8);
        for(let i=0; i<12; i++) { let p = new THREE.Mesh(geo, mat); p.position.copy(pos); p.userData = { vx:(Math.random()-0.5)*0.4, vy:Math.random()*0.4, vz:(Math.random()-0.5)*0.4, life:1 }; sceneRef.add(p); particles.push({mesh: p, scene: sceneRef}); }
    }

    const clock = new THREE.Clock(); window.addEventListener('resize', () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

    function animate() {
        requestAnimationFrame(animate); const time = clock.getElapsedTime();
        camera.position.x += (tx - camera.position.x) * 0.05; camera.position.y += (ty - camera.position.y) * 0.05; camera.lookAt(0, 0, 0);

        penguins.forEach(p => {
            if(p.userData.active && p.parent) {
                p.position.x += p.userData.vx; p.position.z += p.userData.vz;
                
                // WALL BOUNCE
                if(p.position.x > 15 || p.position.x < -15) p.userData.vx *= -1; 
                if(p.position.z > 10 || p.position.z < -15) p.userData.vz *= -1;
                
                // TERRAIN COLLISSION
                activeTerrains.forEach(t => {
                    const dx = p.position.x - t.position.x; const dz = p.position.z - t.position.z;
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    if(dist < t.userData.radius + 0.8) {
                        p.userData.vx *= -1; p.userData.vz *= -1;
                        p.position.x += p.userData.vx * 2; p.position.z += p.userData.vz * 2; 
                    }
                });

                p.rotation.y = Math.atan2(p.userData.vx, p.userData.vz);
                const speedTime = time * (p.userData.isSlider ? 25 : 15) + p.userData.offset;
                
                if (p.userData.isSlider) {
                    p.userData.inner.rotation.z = Math.sin(speedTime) * 0.1;
                } else {
                    p.rotation.z = Math.sin(speedTime) * 0.15; p.position.y = Math.abs(Math.sin(speedTime)) * 0.2;
                    if(p.userData.flipperL) { p.userData.flipperL.rotation.z = Math.PI/8 + Math.sin(speedTime)*0.3; p.userData.flipperR.rotation.z = -Math.PI/8 - Math.sin(speedTime)*0.3; }
                }
            }
        });

        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i]; p.mesh.position.x += p.mesh.userData.vx; p.mesh.position.y += p.mesh.userData.vy; p.mesh.position.z += p.mesh.userData.vz;
            p.mesh.userData.vy -= 0.01; p.mesh.userData.life -= 0.03; p.mesh.scale.setScalar(Math.max(p.mesh.userData.life, 0));
            if(p.mesh.userData.life <= 0) { p.scene.remove(p.mesh); particles.splice(i, 1); }
        }
        renderer.render(scene, camera);
    }
    animate();
}