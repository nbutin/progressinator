var LAST_PAGE = '';
var LAST_MODAL = null;
var LAST_CLICK = 32;


function initCore() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => { log('Service Worker Registered'); });
    }
    document.querySelectorAll('.js-modal-trigger').forEach((i) => {
        i.addEventListener('click', () => {
            openModal(document.getElementById(i.dataset.target));
        });
    });
    document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .menu-item').forEach((i) => {
        i.addEventListener('click', () => {
            location.hash = location.hash.split('_')[0];
            closeModal(i.closest('.modal'));
        });
    });
    document.addEventListener('keydown', (event) => {
        if (event.keyCode === 27) { // Escape key
            location.hash = location.hash.split('_')[0];
            closeAllModals();
        }
    });
    document.body.addEventListener('click', (event) => {
        LAST_CLICK = event.clientY;
    });
}

function goTo(){
    log('Go to page', location.hash);
    const hash = location.hash.slice(1);
    const page = hash.split('_')[0].split('--')[0];
    const modal = document.getElementById(str(hash.split('_').slice(1).slice(-1)[0]));
    if (page != LAST_PAGE) {
        document.querySelectorAll('div.page').forEach((item, index) => {
            if (!page && !index) {
                item.classList.remove('hidden');
            } else if (!page) {
                item.classList.add('hidden');
            } else if (item.dataset.name == page) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
        if (page.includes('info-') || page.includes('plus-')) document.getElementById('panel').classList.remove('hidden');
        scroll(0, 0);
    }
    if (modal != LAST_MODAL) {
        LAST_MODAL = modal;
        closeAllModals();
        if (modal) {
            openModal(modal);
            const card = modal.querySelector('.modal-content');
            const height = card.offsetHeight;
            card.style.top = LAST_CLICK - height/2 + 'px';
            if (card.parentElement.id == 'menu') card.style.top = '144px';
            else if (LAST_CLICK - height/2 < 64) card.style.top = '16px';
            else if (window.innerHeight < LAST_CLICK + height/2 + 16)
                card.style.top = window.innerHeight - height - 16 + 'px';
            if (_modal_triggers[modal.id]) _modal_triggers[modal.id]();
        }
    }
    LAST_PAGE = page;
}


function log() {
    return;
    var items = [];
    var first = true;
    Object.entries(arguments).forEach(entry => {
        items.push(entry[1]);
        if (first) {
            items.push(':');
            first = false;
        } else {
            items.push(',');
        }
    })
    console.log(...items.slice(0, -1));
}


function cached(key, val) {
    if (val != undefined) sessionStorage[key] = val;
    else return sessionStorage[key];
}


function stored(key, val) {
    if (val != undefined) localStorage[key] = val;
    else return str(localStorage[key]);
}


function storedToken(val) {
    return stored('token', val)
}


function storedAddress(val) {
    return stored('address', val)
}


function storedDump(val) {
    return stored('dump', val)
}


function str(val) {
    return val && val.toString() || '';
}


function val(val) {
    return str(val).replace(/:|,|;;/g, '-');
}


function num(val) {
    return (val - 0) || 0;
}


function obj(val) {
    return val && (val.toString() == '[object Object]') && val || {};
}


function formatDate(date) {
    if (!date) date = new Date();
    return date.toLocaleDateString('ru').split('.').reverse().join('-');
}


function loadValues(dump) {
    log('Unpaking values', str(dump));
    const raw_values = {};
    str(dump || storedDump()).split(';; ').forEach(i => {
        const k = i.split(': ')[0].trim();
        if (k in _template) {
            raw_values[k] = str(i.split(': ')[1]).trim();
        }
    });
    const parsed_values = {};
    for (const key in raw_values) {
        if (typeof(_template[key]) == typeof({})) {
            parsed_values[key] = {};
            raw_values[key].split(', ').forEach(i => {
                const k = str(i.split(' ')[0]);
                let v = str(i.split(' ').slice(1).join(' '));
                if (k && v) {
                    if (v == num(v)) v = num(v);
                    parsed_values[key][k] = v;
                }
            });
            for (const k in _template[key]) {
                if (!(k in parsed_values[key])) {
                    parsed_values[key][k] = _template[key][k];
                }
            }
        } else {
            parsed_values[key] = raw_values[key];
        }
    }
    for (const key in _template) {
        if (!(key in parsed_values)) {
            parsed_values[key] = _template[key];
        }
    }
    if (parsed_values.trophies._) {
        parsed_values.trophies.today = parsed_values.trophies._;
        delete parsed_values.trophies._;
    }
    if (parsed_values.heroes._) {
        parsed_values.heroes.today = parsed_values.heroes._;
        delete parsed_values.heroes._;
    }
    log('Values unpacked');
    return parsed_values;
}


function saveValues(without_posting, timeout) {
    log('Counting, packing and saving values');
    const history = Object.entries(_values.history).sort();
    if (history.length > _history_length) {
        const trimed = history.slice(-_history_length);
        const offcut = history.slice(0, -_history_length);
        offcut.forEach(i => {
            i[1].split('').forEach(x => {
                _values.tails[x] += 5;
            });
        });
        _values.history = {};
        trimed.forEach(x => {
            _values.history[x[0]] = x[1];
        });
    }
    const numbers = Object.assign({}, _values.tails);
    const progress = _values.trophies['today'];
    for (const k in _values.history) {
        _values.history[k].split('').forEach(x => {
            numbers[x] += 5;
            const factor = _values.trophies['today'].split(x).length;
            if (numbers[x] >= 150 * factor) {
                _values.trophies['today'] += x;
            }
        });
    }
    let size = 12;
    if (_values.solid) size = 24
    if (_values.trophies['today'].length > size) {
        const date = formatDate(new Date());
        _values.trophies[date] = _values.trophies['today'].slice(0, size);
        _values.trophies['today'] = _values.trophies['today'].slice(size);
        _values.trophies[date].split('').forEach(x => {
            _values.tails[x] -= 150;
            numbers[x] -= 150;
        });
        if (_values.heroes['today']) {
            _values.heroes[date] = _values.heroes['today'];
            stored(date, stored('today'));
            log('Hero image are copied', stored('today').length);
            _values.heroes['today'] = '';
        }
    }
    var is_progressed = false;
    if (_values.trophies['today'] != progress) {
        is_progressed = true;
    }
    _values.trophies['today'].split('').forEach(x => {
        numbers[x] -= 150;
    });
    for (const k in numbers) {
        let n = numbers[k];
        if (n < 0 && _values.trophies['today'].slice(-1) == k) {
            _values.trophies['today'] = _values.trophies['today'].slice(0, -1);
            n += 150;
        }
        if (n >= 0) n = ('000' + n).slice(-3);
        document.querySelector(`.totals .score.${k}`).innerHTML = n;
    }
    var dump = '';
    var recounted_friends = {};
    var index = 0;
    document.querySelectorAll('#friends .field').forEach(item => {
        if (index > 1) {
            let name = item.querySelectorAll('input')[0].value;
            let addr = item.querySelectorAll('input')[1].value;
            if (name || addr) {
                recounted_friends[index - 2] = `${addr};${name}`;
                index++;
            }
        } else {
            index++;
        }
    });
    if (Object.keys(recounted_friends).length == 0) recounted_friends[0] = '-;-'
    _values.friends = recounted_friends;
    for (const key in _template) {
        if (typeof(_values[key]) == typeof({})) {
            let values = [];
            for (const k in _values[key]) {
                if (val(_values[key][k])) {
                    values.push(`${k} ${val(_values[key][k])}`);
                }
            }
            values = values.sort().join(', ');
            dump += `${key}: ${values};; `;
        } else {
            dump += `${key}: ${val(_values[key])};; `;
        }
    }
    storedDump(dump.slice(0, -3));
    log('Values saved');
    drawPoints();
    drawBadge();
    if (is_progressed) setTimeout(share, 500);
    drawHistoryPoints();
    if (!without_posting) {
        clearTimeout(_postponed_actions.save);
        _postponed_actions.save = setTimeout(function() {
            updateTphPage();
        }, timeout || 2000);
    }
}


function syncValues(dump) {
    const values = loadValues(dump);
    var local = Object.entries(_values.history).sort().reverse();
    var remote = Object.entries(values.history).sort().reverse();
    if (str(local[0] || '') < str(remote[0])) {
        Object.assign(_values, values);
    } else if (local.length <= remote.length) {
        const lv_copy = Object.assign({}, _values);
        Object.assign(_values, values);
        for (k in lv_copy.history) {
            if (!_values.history[k]) {
                _values.history[k] = lv_copy.history[k];
            }
        }
    }
    prepareAllFriendsElements();
    displayHistory();
    saveValues();
    log('Synchronized');
}


function encodeUriParams(obj) {
    return Object.entries(obj).map(([key, val]) => {
        if (typeof val === "object") {
            return `${key}=` + encodeURIComponent(JSON.stringify(val));
        } else {
            return `${key}=` + encodeURIComponent(val);
        }
    }).join('&');
}


function useTelegraph(method, params, resultCallback, errorCallback, strict) {
    fetch(`https://api.telegra.ph/${method}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    })
    .then((resp) => {
        if (resp.status === 200) {
            return resp.json();
        } else {
            return Promise.reject("server");
        }
    })
    .then((resp) => {
        if (resp.ok) {
            log(`${method}: ok`);
            if (resultCallback) resultCallback(resp.result);
        } else if (resp.error == 'ACCESS_TOKEN_INVALID') {
            if (strict) alert(document.getElementById('wrong-token').value);
            if (errorCallback) errorCallback(resp);
        } else if (resp.error) {
            if (strict) alert(resp.error);
            if (errorCallback) errorCallback(resp);
        } else if (strict) {
            alert(document.getElementById('unknown-error').value);
            if (errorCallback) errorCallback();
        } else {
            if (errorCallback) errorCallback();
            log(`${method}: error`);
        }
    })
    .catch((err) => {
        if (strict && (err == "server")) {
            alert(document.getElementById('server-error').value);
        } else if (strict) {
            alert(document.getElementById('no-connection').value);
        } else if (err != "server") {
            log(err);
        }
        if (errorCallback) errorCallback();
    });
}


function connectTelegraph(otherToken, callback, strict) {
    const addressInput = document.querySelector('.address input[readonly]');
    const token = otherToken || storedToken();
    if (token) {
        getTphPageList(token, (result) => {
            if (otherToken) {
                storedToken(otherToken);
            }
            document.getElementById('token').innerText = token;
            if (result.pages) {
                let path;
                result.pages.some((p) => {
                    path = p.path;
                    if (p.title.slice(0, 10) == 'Life Tuner') {
                        return true;
                    }
                });
                // TODO: if no page?
                storedAddress(path);
                addressInput.value = path;
                getTphPage(path, (result) => {
                    syncValues(result);
                    activateControls();
                    if (callback) {
                        callback(result);
                    }
                }, null, strict);
            } else {
                createTphPage((result) => {
                    storedAddress(result.path);
                    addressInput.value = result.path;
                    if (callback) {
                        callback(result);
                    }
                    activateControls();
                    updateTphPage();
                }, strict);
            }
        }, strict);
    } else {
        createTphAccount((result) => {
            document.getElementById('token').innerText = result.access_token;
            storedToken(result.access_token);
            createTphPage((result) => {
                storedAddress(result.path);
                addressInput.value = result.path;
                activateControls();
                updateTphPage();
            });
        });
    }
}


function createTphAccount(resultCallback) {
    const params = encodeUriParams({
        short_name: '@shorewards',
        author_name: '@shorewards',
        author_url: 'https://t.me/s/shorewards',
    });
    useTelegraph('createAccount', params, result => {
        if (resultCallback) {
            resultCallback(result);
        }
    });
}


function getTphPageList(token, resultCallback, strict) {
    if (!storedToken()) return;
    const params = encodeUriParams({
        access_token: token,
    });
    useTelegraph('getPageList', params, result => {
        if (resultCallback) {
            resultCallback(result);
        }
    }, null, strict);
}


function getTphPage(address, resultCallback, errorCallback, strict) {
    const params = encodeUriParams({
        return_content: true,
    });
    useTelegraph('getPage/' + (address || storedAddress()), params, result => {
        if (resultCallback) {
            resultCallback(result.content[0].children[0]);
        }
    }, errorCallback, strict);
}


function createTphPage(resultCallback, strict) {
    if (!storedToken()) return;
    const params = encodeUriParams({
        access_token: storedToken(),
        title: ((new Date()).getFullYear() + '').slice(2),
        content: [{"tag":"p","children":["new"]}],
    });
    useTelegraph('createPage', params, result => {
        log('Address', result.path);
        if (resultCallback) {
            resultCallback(result);
        }
    }, null, strict);
}


function updateTphPage(path, data, resultCallback) {
    if (!storedToken()) return;
    if (path && data) {
        let params = encodeUriParams({
            access_token: storedToken(),
            title: 'Image',
            author_name: '@shorewards',
            author_url: 'https://t.me/s/shorewards?q=%23lifetuner',
            content: [{"tag":"p","children":[data]}],
        });
        useTelegraph('editPage/' + path, params, resultCallback);
    } else {
        let params = encodeUriParams({
            access_token: storedToken(),
            title: 'Life Tuner (' + storedAddress() + ')',
            author_name: '@shorewards',
            author_url: 'https://t.me/s/shorewards?q=%23lifetuner',
            content: [{"tag":"p","children":[
                storedDump() || "edited",
            ]}],
        });
        useTelegraph('editPage/' + storedAddress(), params);
    }
}


function openModal(modal) {
    modal.classList.add('is-active');
}


function closeModal(item) {
    item.classList.remove('is-active');
}


function closeAllModals() {
    document.querySelectorAll('.modal').forEach((i) => {
        closeModal(i);
        if (i.id == "menu") {
            let target = document.querySelector('#homepage .button.question');
            target.classList.remove('is-static');
            target.style = '';
        }
    });
}


let _install_prompt;


window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _install_prompt = e;
});


function install(){
    if (_install_prompt){
        _install_prompt.prompt();
        _install_prompt.userChoice.then(r => {
            if (r.outcome === 'accepted') {
                log('Installation accepted');
            } else {
                log('Installation refused');
            }
        });
    } else {
        location.hash = 'info-settings_installation-alert';
    }
}


function restore() {
    var input = document.getElementById('import').value;
    if (input.length < 69) {
        input = input.replace(/\W/g, '');
        location.hash = 'homepage';
        connectTelegraph(input, () => {}, true);
    } else {
        location.hash = 'homepage';
        syncValues(input);
    }
}


function compressCanvasImage(canvas) {
    var result;
    [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].some((x) => {
        result = canvas.toDataURL('image/jpeg', x);
        log('Have compressed image', x, result.length);
        if (result.length <= 50*1024) return true;
    });
    return result;
}


function correctText(text) {
    text = text.replaceAll('&nbsp;', '\xA0');
    text = text.replaceAll(/[ \t\n\r]+/gi, ' ');
    '— – -- -'.split(' ').forEach((i) => {
        text = text.replaceAll(` ${i} `, '\xA0— ');
    });
    text = text.replaceAll('.', '. ');
    text = text.replaceAll(' .', '.');
    text = text.replaceAll(' ,', ',');
    text = text.replaceAll('т. д.', 'т.\xA0д.');
    text = text.replaceAll('т. п.', 'т.\xA0п.');
    text = text.replaceAll(/ +/g, ' ');
    'а А в В во Во до До для Для ее Ее её Её за За из Из и И их Их к К на На не Не ни Ни но Но о О от От он Он по По с С со Со у У я Я'.split(' ').forEach((i) => {
        text = text.replaceAll(` ${i} `, ` ${i}\xA0`);
    });
    'АБВГДЕЁЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'.split('').forEach((i) => {
        text = text.replaceAll(` ${i}. `, ` ${i}.\xA0`);
        text = text.replaceAll(`\xA0${i}. `, `\xA0${i}.\xA0`);
    });
    text = text.replace(/(\. [А-я\w]{1,4}) ([А-я\w])/ig, '$1\xA0$2');
    let result = [];
    text.split(' ').forEach(w => {
        if (w.includes('-') || w.length < 20) {
            result.push(w);
        } else {
            result.push(shy(w));
        }
    });
    //let re = new RegExp("([А-яЁё\xA0-]{10,})","ig");
    //text = text.replace(re1, `${shy($1)}`);
    //text = text.replace(/(, [А-я\w]{1,3}) ([А-я\w])/ig, '$1\xA0$2');
    //text = text.replace(/([А-я\w]) ([А-я\w]{1,4}.\s*$)/ig, '$1\xA0$2');
    return result.join(' ');
}


function correctTextNodes() {
    getTextNodesIn(document.body).forEach((i) => {
        let fixed = document.createElement('span');
        i.parentNode.insertBefore(fixed, i);
        i.parentNode.removeChild(i);
        fixed.outerHTML = correctText(i.data || '');
    });
}


function getTextNodesIn(container, filter) {
    let textNodes = [];
    if (container) {
        for (let nodes = container.childNodes, i = nodes.length; i--;) {
            let node = nodes[i], nodeType = node.nodeType;
            if (nodeType == 3) {
                if (!filter || filter(node, container)) {
                  textNodes.push(node);
                }
            } else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
                textNodes = textNodes.concat(getTextNodesIn(node, filter));
            }
        }
    }
    return textNodes;
}


function shy(text)
{
    // материализация, надеемся
        var RusA = "[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]";
        var RusV = "[аеёиоуыэюя]";
        var RusN = "[бвгджзклмнпрстфхцчшщ]";
        var RusX = "[йъь]";
        var re1 = new RegExp("("+RusX+")("+RusA+RusA+")","ig");
        var re2 = new RegExp("("+RusV+")("+RusV+RusA+")","ig");
        var re3 = new RegExp("("+RusV+RusN+")("+RusN+RusV+")","ig");
        var re4 = new RegExp("("+RusN+RusV+")("+RusN+RusV+")","ig");
        var re5 = new RegExp("("+RusV+RusN+")("+RusN+RusN+RusV+")","ig");
        var re6 = new RegExp("("+RusV+RusN+RusN+")("+RusN+RusN+RusV+")","ig");
        text = text.replace(re1, "$1\xAD$2");
        text = text.replace(re2, "$1\xAD$2");
        text = text.replace(re3, "$1\xAD$2");
        text = text.replace(re4, "$1\xAD$2");
        text = text.replace(re5, "$1\xAD$2");
        text = text.replace(re6, "$1\xAD$2");
        return text;
}
