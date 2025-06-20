const app_author = 'PHN3UprgHjMPQsiXkqEju9bAqCmD73H6B9';
const _modal_triggers = {
    upload: showSelectedHero,
};
const _template = {
    coins: {},
    history: {},
    tails: {E: 0, P: 0, I: 0, S: 0, M: 0},
    trophies: {today: ''},
    heroes: {today: ''},
    friends: {0: '23-01-28;Sdrawerohs'},
    lang: navigator.languages.join('.'),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    installed: '',
    solid: '',
};
const _values = Object.assign({}, _template);
const _postponed_actions = {};
const _displayed_date = new Date();
const _history_length = 31;


var _friend_in_focus;
var _friend_changed;
var app_activated = false;


function activateControls() {
    hideInstruction();
    if (!app_activated) {
        document.querySelectorAll('table.plus td').forEach((i) => {
            i.classList.add(i.id.slice(0, 1));
            i.addEventListener('click', () => {
                setPoints(i);
            });
        });
        document.querySelector('table.plus').classList.remove('disabled');
        app_activated = true;
    }
    document.getElementById('like').classList.add('X');
}


function hideInstruction() {
    const badge = document.getElementById('badge');
    const intro = document.getElementById('intro');
    if (stored('instructed') || Object.keys(_values.history).length) {
        badge.classList.remove('hidden');
        intro.classList.add('hidden');
    } else {
        intro.classList.remove('hidden');
        badge.classList.add('hidden');
    }
}


function initApp() {
    initCore();
    window.addEventListener('hashchange', goTo);
    window.addEventListener('focus', shiftDate);
    document.getElementById('fileinput').addEventListener('change', prepareImage);
    correctTextNodes();
}


function drawInitialElements() {
    hideInstruction();
    drawCoins();
    shiftDate(0);
    drawBadge();
    prepareAllFriendsElements();
    saveValues(true);
    displayHistory();
    displayAllBadges();
    goTo();
    connectTelegraph();
    setTimeout(activateControls, 3000);
}


function startStandalone() {
    initApp();
    Object.assign(_values, loadValues());
    drawInitialElements();
}


document.addEventListener('DOMContentLoaded', () => {
    window.sdk = new BastyonSdk();
    console.log('preparation for  start');
    sdk.init().then((obj) => {
        console.log('sdk initialized');
        sdk.emit('loaded');
    });
    startStandalone();
});


function setInstructed() {
    stored('instructed', 1);
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('badge').classList.remove('hidden');
}


function toggleIntro() {
    const intro = document.getElementById('intro');
    if (str(intro.classList).includes('hidden')) {
        document.getElementById('badge').classList.add('hidden');
        intro.classList.remove('hidden');
    } else {
        document.getElementById('badge').classList.remove('hidden');
        intro.classList.add('hidden');
    }
}


function showScoreComment(val) {
    let increase = val.length * 5;
    if (increase) {
        clearTimeout(_postponed_actions.hint);
        document.getElementById('hint-points').innerText = increase;
        document.getElementById('hint').className = val.slice(0, 1);
        _postponed_actions.hint = setTimeout(function() {
            document.getElementById('hint').className = 'hidden';
        }, 2500);
    } else {
        document.getElementById('hint').className = 'hidden';
    }
}


function setPoints(cell) {
    var prev_month = formatDate(new Date(new Date().setDate(0))).slice(0, -3);
    var this_month = formatDate(_displayed_date).slice(0, -3);
    if (prev_month < this_month && !(prev_month in _values.coins)) saveMonthCoins();
    if (Object.keys(_values.history).length >= _history_length
        && Object.keys(_values.history).sort()[0] > formatDate(_displayed_date))
        return;
    let score = str(_values.history[formatDate(_displayed_date)]);
    const points = score.split(cell.id.slice(0, 1)).length - 1;
    let like = document.getElementById('like');
    'XEPISM'.split('').forEach((i) => {
        like.classList.remove(i);
    });
    like.classList.add(cell.id.slice(0, 1));
    if (cell.id.length == points && cell.classList.contains('bg')) {
        if (cell.id.includes('M')) {
            var val = '';
        } else {
            var val = cell.id.slice(1);
        }
    } else {
        var val = cell.id;
    }
    score = score.split(cell.id.slice(0, 1)).join('') + val;
    var amount = 0;
    var counted = '';
    score.replace(/M/g, '').split('').forEach((i) => {
        const q = score.split(i).length - 1;
        if (!counted.includes(i)) {
            counted += i;
            amount += q * 5;
        }
    });
    if (amount > 30) {
        score = score.split('M').join('') + 'MMM';
    }
    _values.history[formatDate(_displayed_date)] = score;
    saveValues();
    showScoreComment(val);
    drawCoins();
}


function drawPoints() {
    document.querySelectorAll('table.points td').forEach(i => {
        i.classList.remove('bg');
    });
    str(_values.history[formatDate(_displayed_date)]).split('').forEach(i => {
        let cells = document.querySelectorAll('table.points td.' + i + ':not(.bg)');
        Array.from(cells).reverse()[0].classList.add('bg');
    });
    log('Points redrawn');
}


function drawBadge(target, hero, values) {
    let size = 12;
    const trophies = Object.entries(_values.trophies);
    if (!target && (_values.trophies['today'] || trophies.length == 1)) {
        hero = 'today';
        values = _values.trophies['today'];
    } else if (!target) {
        hero = trophies.sort().reverse()[1][0];
        values = trophies.sort().reverse()[1][1];
    } else {
        values = str(values);
    }
    if (values.length > 12 || (hero == 'today' && _values.solid)) size = 24;
    if (!target) target = document.getElementById('badge');
    log('Rendering of badge', hero, values);
    const image = new Image();
    image.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', 960);
        canvas.setAttribute('height', 960);
        const r1 = 480;
        const r2 = 360;
        const r3 = 240;
        const ctx = canvas.getContext('2d');
        const colors = {E: '#009900', P: '#cc0000', I: '#006699', S: '#9900cc', M: '#ff9900', O: '#e7e7e7', }
        const shades = {E: '#ccebcc', P: '#f5cccc', I: '#cce0eb', S: '#ebccf5', M: '#ffebcc', O: '#f8f8f8', }
        const x = 360 / 12;
        ctx.drawImage(image, r1-r3, r1-r3, r3*2, r3*2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 12;
        lineWidth2 = 6;
        if (size == 12) {
            for (let i=0; i < 12; i++) {
                ctx.beginPath();
                ctx.arc(r1, r1, r2+1, (Math.PI/180) * (-90 + i * x), (Math.PI/180) * (-90 + (i+1) * x));
                ctx.arc(r1, r1, r3, (Math.PI/180) * (-90 + (i+1) * x), (Math.PI/180) * (-90 + i * x), true);
                ctx.fillStyle = colors[values[i] || 'O'];
                ctx.fill();
            }
        } else {
            const rx = 420;
            for (let i=0; i < 24; i++) {
                ctx.beginPath();
                if ([0,3,4,7,8,11,12,15,16,19,20,23].includes(i)) {
                    ctx.arc(r1, r1, r3, (Math.PI/180) * (-90 + parseInt(i / 2) * x), (Math.PI/180) * (-90 + (parseInt(i / 2) + 1) * x));
                    if ([3,7,11,15,19,23].includes(i)) {
                        var delta = 1;
                    } else {
                        var delta = 0;
                    }
                    const angle = (Math.PI/180) * (-90 + (parseInt(i / 2) + delta) * x);
                    var x1 = r1 + Math.cos(angle) * rx;
                    var y1 = r1 + Math.sin(angle) * rx;
                    ctx.lineTo(x1, y1);
                    ctx.fillStyle = colors[values[i] || 'O'];
                    ctx.fill();
                } else {
                    ctx.arc(r1, r1, rx, (Math.PI/180) * (-90 + parseInt(i / 2) * x), (Math.PI/180) * (-90 + (parseInt(i / 2) + 1) * x));
                    if ([2,6,10,14,18,22].includes(i)) {
                        var delta = 0;
                    } else {
                        var delta = 1;
                    }
                    const angle = (Math.PI/180) * (-90 + (parseInt(i / 2) + delta) * x);
                    var x2 = r1 + Math.cos(angle) * r3;
                    var y2 = r1 + Math.sin(angle) * r3;
                    ctx.lineTo(x2, y2);
                    ctx.fillStyle = colors[values[i] || 'O'];
                    ctx.fill();
                }
                if (i % 2 != 0) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineWidth = lineWidth2;
                    ctx.stroke();
                }
            }
        }
        for (let i=0; i < size; i++) {
            ctx.beginPath();
            ctx.arc(r1, r1, r1, (Math.PI/180) * (90 + i * 360 / size), (Math.PI/180) * (90 + (i+1) * 360 / size));
            ctx.arc(r1, r1, r2, (Math.PI/180) * (90 + (i+1) * 360 / size), (Math.PI/180) * (90 + i * 360 / size), true);
            ctx.fillStyle = shades[values[i] || 'O'];
            ctx.fill();
        }
        for (let i=0; i < 12; i++) {
            ctx.beginPath();
            const angle = (Math.PI/180) * (90 + i * x);
            const x1 = r1 + Math.cos(angle) * r3;
            const y1 = r1 + Math.sin(angle) * r3;
            const x2 = r1 + Math.cos(angle) * r1;
            const y2 = r1 + Math.sin(angle) * r1;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 12;
            ctx.stroke();
        }
        if (size == 24) {
            for (let i=0; i < 24; i++) {
                ctx.beginPath();
                const angle = (Math.PI/180) * (90 + i * x / 2);
                const x1 = r1 + Math.cos(angle) * r2;
                const y1 = r1 + Math.sin(angle) * r2;
                const x2 = r1 + Math.cos(angle) * r1;
                const y2 = r1 + Math.sin(angle) * r1;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = lineWidth2;
                ctx.stroke();
            }
        }
        ctx.beginPath();
        ctx.arc(r1, r1, r3, 0, Math.PI * 2);
        ctx.lineWidth = 12;
        ctx.stroke();
        if (1 || size == 24) {
            ctx.beginPath();
            ctx.arc(r1, r1, r2, 0, Math.PI * 2);
            ctx.lineWidth = lineWidth2;
            ctx.stroke();
        }
        target.src = canvas.toDataURL();
        log('Rendering of badge finished', hero, values);
    }
    loadImage(hero, image);
}


function setSolidity(val) {
    if (val) {
        document.querySelectorAll('#badges .tabs li .half').forEach((target) => {
            target.parentNode.classList.remove('is-active');
        });
    } else {
        document.querySelectorAll('#badges .tabs li .half').forEach((target) => {
            target.parentNode.classList.add('is-active');
        });
    }
}


function toggleSolidity() {
    _values.solid = str(!_values.solid && 1 || '');
    setSolidity(_values.solid);
    saveValues();
    drawBadge(document.getElementById('badge--today'), 'today', _values.trophies.today);
}


function shiftDate(delta) {
    let days = document.getElementById('days').value.split(' ');
    if (Number.isInteger(delta)) {
        if (delta > 0) delta = 1;
        else if (delta < 0) delta = -1;
        if (_displayed_date < (new Date()) || delta < 0)
            _displayed_date.setDate(_displayed_date.getDate() + delta);
        document.getElementById('date').innerText = formatDate(_displayed_date);
        document.getElementById('day').innerText = days[_displayed_date.getDay()];
    }
    if (formatDate(_displayed_date) == formatDate(new Date())) {
        document.getElementById('btn-next-day').classList.add('hidden');
        document.getElementById('btn-calendar').classList.remove('hidden');
    } else {
        document.getElementById('btn-calendar').classList.add('hidden');
        document.getElementById('btn-next-day').classList.remove('hidden');
    }
    log('Date shifted', str(delta));
    if (typeof(delta) == typeof(0)) drawPoints();
}


function displayHistory(trigger) {
    console.log('Have called displayHistory');
    if (!trigger || !trigger.name) {
        var friends = document.querySelectorAll('.field.address');
        friends.forEach(item => {
            if (!item.id) {
                drawHistoryPoints();
                return;
            }
            var index = item.id.split('--')[1];
            var addr = item.querySelector('input.addr').value;
            var name = `${addr};` + item.querySelector('input.name').value;
            if (addr) {
                log(`Trying to load history: ${index}, ${name}, ${addr}`);
                getTphPage(addr, (dump) => {
                    drawHistoryPoints(dump, name, index);
                    drawCoins();
                    stored(addr, dump);
                }, (resp) => {
                    drawHistoryPoints(stored(addr), name, index);
                });
            }
        });
    } else {
        var entry = trigger.parentNode.parentNode;
        var index = entry.id.split('--')[1];
        var addr = entry.querySelector('.addr').value || '';
        var name = entry.querySelector('.name').value || '';
        if (trigger.name == 'name') {
            document.querySelector(`#history--${index} h3`).innerText = name || 'Someone';
        } else if (trigger.name == 'addr') {
            var table = document.querySelector(`#history--${index}`);
            if (addr) {
                table.classList.remove('hidden');
                log(`Trying to load history: ${name}, ${addr}`);
                getTphPage(addr, (dump) => {
                    drawHistoryPoints(dump, name, index);
                    stored(addr, dump);
                }, (resp) => {
                    drawHistoryPoints(stored(addr), name, index);
                });
            } else {
                table.classList.add('hidden');
                log(`Hide history: ${name}, ${addr}`);
            }
        }

        document.querySelector(`#history--${index} .button`).onclick = () => {displayAllBadges(addr, name, parseInt(index))};

        if (!name && !addr) {
            delete(_values.friends[index]);
        } else {
            _values.friends[index] = `${addr};${name}`;
        }
        saveValues();
    }
}


function displayAllBadges(addr, name, index) {
    log('Have called displayAllBadges', addr, name, index);
    function displayBadge(values, name) {
        const container = document.querySelector('#badges');
        let template;
        container.querySelectorAll('.stored-badge').forEach((item) => {
            if (!template) {
                template = item;
            } else {
                item.remove();
            }
        });
        let i = 0;
        const max_count = 6;
        let hero;
        let section;
        document.getElementById('registration-date').innerText = addr.slice(0, 8);
        setSolidity(_values.solid);
        Object.entries(values.trophies).sort().reverse().forEach(([k, v]) => {
            i++;
            if (i > max_count) return;
            if (typeof(index) == 'number') {
                hero = str(values.heroes[k]);
                if (i == 1) section = name;
                else section = k.slice(2);
            } else if (k == 'today') {
                hero = k;
                section = name;
            } else {
                hero = k;
                section = k.slice(2);
            }
            let badge = template.cloneNode(true);
            if (i == max_count) badge.setAttribute('style', 'opacity:0.2;'); 
            let img = badge.querySelector('img');
            badge.classList.remove('hidden');
            if (section && section == name) badge.querySelector('h3').innerText = section;
            else if (section) badge.querySelector('h3').innerText = '20' + section;
            let a = badge.querySelector('button.calendar').parentNode;
            a.name = `plus-badges--${hero}`;
            img.id = `badge--${hero}`;
            if (typeof(index) != 'number') {
                img.onclick = () => {location.hash = `${a.name}_upload`};
            } else {
                img.style.cursor = 'default';
            }
            container.append(badge);
            drawBadge(img, hero, values.trophies[k]);
        });
    }
    if (!addr) {
        addr = storedAddress();
        name = '';
        index = '';
        displayBadge(_values, name);
    } else {
        getTphPage(addr, (dump) => {
            displayBadge(loadValues(dump), name);
            stored(addr, dump);
        }, (resp) => {
            displayBadge(loadValues(stored(addr)), name);
        });
    }
}


function showSelectedHero() {
    const strip = (data) => {return data.split(':: ').slice(-1)[0]};
    const img = document.getElementById('uploaded');
    let key = location.hash.slice(1).split('_')[0].split('--').slice(-1)[0];
    if (!key && !_values.trophies.today && Object.keys(_values.trophies).length > 1) {
        key = Object.keys(_values.trophies).sort().reverse()[1];
    } else if (!key) {
        key = 'today';
    }
    img.src = strip(stored(key)) || _image;
    img.name = key;
    log('Have displayed selected hero', key);
}


function prepareFriendElements(addr, name, index) {
    log('Have called prepareFriendElements', addr, name, index);
    var container = document.getElementById('friends');
    var template = document.getElementById('friend--');
    var created = template.cloneNode(true);
    created.id = 'friend--' + index;
    created.classList.remove('hidden');
    var eladdr = created.querySelector('input.addr');
    var elname = created.querySelector('input.name');
    eladdr.value = addr;
    elname.value = name;
    eladdr.onfocus = () => {setTimeout(() => {_friend_in_focus = true;}, 50)};
    elname.onfocus = () => {setTimeout(() => {_friend_in_focus = true;}, 50)};
    eladdr.onchange = (event) => {_friend_changed = true; normAddress(event); displayHistory(event.target);};
    elname.onchange = (event) => {_friend_changed = true; normName(event); displayHistory(event.target);};
    eladdr.onblur = (event) => {_friend_in_focus = false; setTimeout(() => {updateFriends();}, 100)};
    elname.onblur = (event) => {_friend_in_focus = false; setTimeout(() => {updateFriends();}, 100)};
    container.append(created);

    container = document.getElementById('histories');
    template = document.getElementById('empty-history');
    created = template.cloneNode(true);
    template.querySelector('.button').onclick = () => {displayAllBadges()};
    created.id = `history--${index}`;
    name = name || 'Someone';
    created.querySelector('h3').innerText = name;
    created.querySelector('a').name = `info--history--${index}`;
    created.querySelector('.button').onclick = () => {displayAllBadges(addr, name, index)};
    if (!addr) created.classList.add('hidden');
    container.append(created);
}


function prepareAllFriendsElements() {
    log('Have called prepareAllFriendsElements');
    const friends = Object.entries(_values.friends).sort();
    var i = 0;
    document.querySelectorAll('#friends .field').forEach(el => {
        if (i > 1) el.remove();
        i++;
    });
    i = 0;
    document.querySelectorAll('#histories .history').forEach(el => {
        if (i > 0) el.remove();
        i++;
    });
    i = 0;
    friends.concat([['', ''], ['', '']]).slice(0, 8).forEach((entry) => {
        const addr = str(entry[1].split(';')[0]);
        const name = str(entry[1].split(';')[1]);
        if (entry[1].trim().replace(/-/g, '') != ';') prepareFriendElements(addr, name, i);
        i++;
    });
}


function drawHistoryPoints(data, name, index) {
    log('Have called drawHistoryPoints');
    const date = new Date();
    date.setDate(date.getDate() - _history_length + 1);
    var cells = ''
    for (let i = 0; i < _history_length; i++) {
        cells += '<td></td>';
    }
    if (data) {
        log('Parsing loaded friend\'s history');
        var table_id = `history--${index}`;
        var history = loadValues(data).history;
    } else {
        log('Drawing own history');
        var table_id = 'my-history';
        var history = _values.history;
    }
    document.querySelectorAll(`#${table_id} .control`)[1].classList.remove('hidden');
    const container = document.querySelector(`#${table_id} table tr`);
    container.innerHTML = cells;
    cells = document.querySelectorAll(`#${table_id} table td`);
    for (let i = 0; i < _history_length; i++) {
        var result = [];
        var score = str(history[formatDate(date)]);
        date.setDate(date.getDate() + 1);
        score = score.replace(/M+/, 'M');
        'MSIPE'.split('').forEach((x) => {
            if (x == 'M') {
                var emptyCells = '';
            } else {
                var emptyCells = '**';
            }
            var trimed = score.replace(x, '');
            while (trimed != score) {
                score = trimed;
                result.push('<a class="' + x + '"></a>');
                emptyCells = emptyCells.slice(1);
                trimed = score.replace(x, '');
            }
            if (emptyCells) {
            result = result.concat(emptyCells.split(''));
        }
        });
        result = [0, 0, 0, 0, 0].concat(result).slice(-13);
        result = result.join(' ').split('*').join('<a></a>');
        result = result.split('0').join('<a class="m"></a>');
        cells[i].innerHTML = result;
    }
}


function loadImage(hero, target) {
    const strip = (data) => {return data.split(':: ').slice(-1)[0]};
    if ((hero == 'today' || _values.trophies[hero]) && stored(hero)) {
        target.src = strip(stored(hero));
        log('Have fetched own image from localStorage');
        if (_values.heroes[hero]) {
            getTphPage(_values.heroes[hero], (data) => {
                if (strip(data) != target.src) {
                    let date = str(data.split('::')[1]);
                    //if (date.length > 20) date = '';
                    let local_date = str(stored(hero).split('::')[1]);
                    //if (local_date.length != 10) local_date = formatDate();
                    if (local_date <= date) {
                        log('Have updated local image from Telegraph');
                        stored(hero, data);
                        target.src = strip(data);
                    } else {
                        log('Trying to update own image in Telegraph');
                        saveImage(hero, target.src);
                    }
                }
            });
        } else {
            log('Trying to create own image in Telegraph');
            saveImage(hero, target.src);
        }
    } else if (_values.heroes[hero]) {
        log('Trying to load own image from Telegraph');
        getTphPage(_values.heroes[hero], (data) => {
            target.src = strip(data);
            log('Have loaded own image from Telegraph');
            stored(hero, data);
        }, (resp) => {
            log('Have displayed default app image');
            target.src = _image;
        });
    } else if (cached(hero) && !(_values.trophies[hero])) {
        target.src = strip(cached(hero));
        log('Have fetched friend\'s hero from sessionStorage');
        getTphPage(hero, (data) => {
            if (strip(data) != target.src) {
                target.src = strip(data);
                log('Have updated friend\'s image from Telegraph');
                cached(hero, data);
            }
        });
    } else if (hero && hero != 'today' && !(_values.trophies[hero])) {
        log('Trying to load friend\'s hero from Telegraph');
        getTphPage(hero, (data) => {
            target.src = strip(data);
            log('Have loaded friend\'s hero from Telegraph');
            cached(hero, data);
        }, (resp) => {
            log('Have displayed default app image');
            target.src = _image;
        });
    } else {
        log('Have displayed default app image');
        target.src = _image;
    }
}


function prepareImage(event) {
    log('Preparing image...');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', 320);
    canvas.setAttribute('height', 320);
    const ctx = canvas.getContext('2d');
    const img = new Image;
    img.onload = function() {
        ctx.drawImage(img, 0, 0, 320, 320);
        ctx.beginPath();
        ctx.arc(160, 160, 160, 0, Math.PI*2);
        ctx.arc(160, 160, 320, Math.PI*2, 0, true);
        ctx.fillStyle = 'white';
        ctx.fill();
        document.getElementById('uploaded').src = compressCanvasImage(canvas);
    }
    if (event) {
        img.src = URL.createObjectURL(event.target.files[0]);
    } else {
        img.src = _image;
    }
}


function applyImage() {
    log('Applying image...');
    const uploaded = document.getElementById('uploaded');
    const data = uploaded.src;
    const hero = uploaded.name;
    result = saveImage(hero, data);
    stored(hero, result);
    drawBadge();
    displayAllBadges();
}


function resetHero() {
    document.getElementById('uploaded').src = _image;
    document.getElementById('fileinput').value = '';
}


function saveImage(hero, data) {
    //date = date || formatDate();
    date = 't' + (new Date()).getTime();
    data = `Let me save this little image here. This is necessary for the operation of a very useful application that makes people better. I have no way to save it in other place ::${date}:: ${data}`;
    if (_values.heroes[hero]) {
        log('Trying to update own image page', _values.heroes[hero], hero, date);
        updateTphPage(_values.heroes[hero], data, (resp) => {
            if (resp.error && ['PAGE_NOT_FOUND', 'PAGE_ACCESS_DENIED'].includes(resp.error)) {
                createTphPage((result) => {
                    log('Has created another own image page', result.path, hero);
                    _values.heroes[hero] = result.path;
                    saveValues(0, 1);
                    updateTphPage(result.path, data);
                });
            }
        });
    } else {
        createTphPage((result) => {
            log('Has created own image page', result.path, hero);
            _values.heroes[hero] = result.path;
            saveValues(0, 1);
            updateTphPage(result.path, data);
        });
    }
    return data
}


function normName(event) {
    let val = [];
    event.target.value.split(/\s+/).forEach(i => {
        if (i.length > 18) val.push(i.slice(0, 16) + '...');
        else val.push(i);
    })
    val = val.join(' ');
    event.target.value = val.replace(/[:;,]/g, '');
}

function normAddress(event) {
    event.target.value = event.target.value.replace(/[^\d\-]/g, '');
}


function updateFriends(target) {
    if (!_friend_in_focus) {
        _friend_changed = false;
        saveValues();
        prepareAllFriendsElements();
        displayHistory();
    }
}


function drawCoins() {
    addStatisticsRows();
    for (i of Object.values(_values.friends)) {
        let [addr, name] = i.split(';');
        addStatisticsRows(addr, name);
    }
}


function getYestMonth() {
    var today = new Date(Date.now());
    var yest = new Date(Date.now() - 24*60*60*1000);
    if (today.getDate() <= 7) var month = formatDate(new Date(new Date().setDate(0)));
    else var month = formatDate(new Date(new Date().setDate(1)));
    month = month.slice(0, -3);
    yest = formatDate(yest);
    return [yest, month];
}


const months_ru = {
    '01': 'январь',
    '02': 'февраль',
    '03': 'март',
    '04': 'апрель',
    '05': 'май',
    '06': 'июнь',
    '07': 'июль',
    '08': 'август',
    '09': 'сентябрь',
    '10': 'октябрь',
    '11': 'ноябрь',
    '12': 'декабрь',
}


function addStatisticsRows(addr, name) {
    const [table0, table1, table2] = document.querySelectorAll('#statistics table tbody');
    const today = formatDate(new Date(Date.now()));
    const [yest, month] = getYestMonth();
    if (!addr) {
        [addr, name] = [stored('address'), 'Я'];
        var values = _values;
        let header = makeStatisticsRowNode().outerHTML;
        table0.innerHTML = header;
        table1.innerHTML = header;
        table2.innerHTML = header;
        document.getElementById('month-ru').innerText = `За ${months_ru[month.slice(5)]}`;
        let node0 = makeStatisticsRowNode(addr, name, ...countCoins(values.history[today] || ''));
        table0.appendChild(node0);
    } else {
        if (name.length > 4) name = name.slice(0, 3) + '.';
        var values = loadValues(stored(addr));
    }
    let node1 = makeStatisticsRowNode(addr, name, ...countCoins(values.history[yest] || ''));
    table1.appendChild(node1);
    if (values.coins[month]) {
        var [a, b1, b2, b3, sum] = values.coins[month].split(';');
        let node2 = makeStatisticsRowNode(addr, name, a, b1, b2, b3, sum);
        table2.appendChild(node2);
    } else {
        var [a, b1, b2, b3, sum] = [0, 0, 0, 0, 0];
        for (day in values.history) {
            if (day.includes(month)) {
                var [a, b1, b2, b3, sum] = countCoins(values.history[day], [a, b1, b2, b3, sum]);
            }
        }
        let node2 = makeStatisticsRowNode(addr, name, a, b1, b2, b3, sum);
        table2.appendChild(node2);
    }
}


function saveMonthCoins() {
    var month = formatDate(new Date(new Date().setDate(0))).slice(0, -3);
    if (!_values.coins[month]) {
        var [a, b1, b2, b3, sum] = [0, 0, 0, 0, 0];
        for (day in _values.history) {
            if (day.includes(month)) {
                var [a, b1, b2, b3, sum] = countCoins(_values.history[day], [a, b1, b2, b3, sum]);
            }
        }
        _values.coins[month] = [a, b1, b2, b3, sum].join(';');
        saveValues();
    }
}


function makeStatisticsRowNode(id, name, a, b1, b2, b3, sum) {
    if (!id) [a, b1, b2, b3, sum] = ['a', 'b1', 'b2', 'b3', 'sum'];
    var html = `<tr name="${id||''}"><td>${name||''}</td><td>${a||0}</td> <td>${b1||0}</td><td>${b2||0}</td><td>${b3||0}</td><td>${sum||0}</td></tr>`;
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}


function countCoins(dv, counted) {
    var [a, b1, b2, b3, sum] = counted || [0, 0, 0, 0, 0];
    a += dv.replaceAll('M', '').length * 5;
    if (dv.length) b1 += 15;
    if (dv.split(/E+|P+|I+|S+/).length > 4) b2 += 15;
    if (dv.includes('M')) b3 += 15;
    sum = a + b1 + b2 + b3;
    return [a, b1, b2, b3, sum];
}


function highlightMenuButton() {
    let target = document.querySelector('#homepage .button.question');
    target.classList.add('is-static');
    target.style = 'z-index:39';
}


function visit(address) {
    var url = `https://bastyon.com/${address || app_author}`;
    if (sdk.applicationInfo) {
        sdk.helpers.channel(address || app_author)
        .catch(() => {
            openExternalLink(url);
        });
    } else {
        openLinkInNewWindow(url);
    }
}


function openExternalLink(url) {
    if (!sdk.applicationInfo) {
        openLinkInNewWindow(url);
    } else {
        sdk.openExternalLink(url)
        .catch(() => {
            sdk.permissions.request(['externallink'])
            .then(() => {
                sdk.openExternalLink(url);
            })
            .catch(() => {
                sdk.helpers.opensettings();
            });
        });
    }
}


function openLinkInNewWindow(href) {
    var a = document.createElement('a');
    a.href = href;
    a.setAttribute('target', '_blank');
    a.click();
}
