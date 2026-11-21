// ==============================
// YARDIMCI FONKSİYONLAR
// ==============================
function yerelTarihStr(tarih = new Date()) {
    const yil = tarih.getFullYear();
    const ay = String(tarih.getMonth() + 1).padStart(2, '0');
    const gun = String(tarih.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
}

function tarihGunEkleStr(baslangicTarihStr, eklenecekGun) {
    const parcalar = (baslangicTarihStr || yerelTarihStr()).split('-').map(Number);
    const d = new Date(parcalar[0], (parcalar[1] || 1) - 1, parcalar[2] || 1);
    d.setDate(d.getDate() + (Number(eklenecekGun) || 0));
    return yerelTarihStr(d);
}

function simdikiSaatStr() {
    return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function para(sayi) {
    const num = Number(sayi) || 0;
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

function yaz(id, metin) {
    const el = document.getElementById(id);
    if (el) el.textContent = metin;
}

function cssDegisken(ad) {
    return getComputedStyle(document.documentElement).getPropertyValue(ad).trim();
}

function toastGoster(mesaj, tur = 'bilgi') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tur}`;
    const ikon = tur === 'hata' ? 'fa-circle-exclamation' : (tur === 'basari' ? 'fa-circle-check' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${ikon}"></i><span>${escapeHTML(mesaj)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'opacity 0.25s, transform 0.25s';
        setTimeout(() => toast.remove(), 260);
    }, 3000);
}

function fiyatKarsilastirmaMetni(ucret, piyasaDegeri) {
    const verilen = Number(ucret) || 0;
    const piyasa = Number(piyasaDegeri) || 0;

    if (piyasa <= 0 && verilen <= 0) {
        return 'Piyasa değeri ve verilen fiyat girildiğinde hesaplanır.';
    }
    if (piyasa <= 0) {
        return `Verilen Fiyat: ${para(verilen)} • Piyasa değeri girilmedi`;
    }
    if (verilen <= 0) {
        return `Piyasa Değeri: ${para(piyasa)} • Verilen fiyat girilmedi`;
    }

    const fark = piyasa - verilen;
    const oran = ((fark / piyasa) * 100).toFixed(1);

    if (fark > 0) {
        return `Piyasa: ${para(piyasa)} vs Bizim: ${para(verilen)} → Piyasadan ${para(fark)} (%${oran}) daha uygun`;
    }
    if (fark < 0) {
        const fazlaOran = ((Math.abs(fark) / piyasa) * 100).toFixed(1);
        return `Piyasa: ${para(piyasa)} vs Bizim: ${para(verilen)} → Piyasanın ${para(Math.abs(fark))} (%${fazlaOran}) üzerinde`;
    }
    return `Piyasa: ${para(piyasa)} vs Bizim: ${para(verilen)} → Piyasa değeri ile birebir aynı`;
}

function fiyatKarsilastirmaGuncelle(ucretId, piyasaId, hedefId) {
    const hedef = document.getElementById(hedefId);
    if (!hedef) return;
    const ucret = parseFloat(document.getElementById(ucretId)?.value) || 0;
    const piyasa = parseFloat(document.getElementById(piyasaId)?.value) || 0;
    hedef.innerHTML = `
        <span><i class="fa-solid fa-scale-balanced tema-ikon"></i> Fiyat Karşılaştırması:</span>
        <span>${escapeHTML(fiyatKarsilastirmaMetni(ucret, piyasa))}</span>
    `;
}

// ==============================
// GÜNÜN KELİMESİ (YAN PANEL)
// ==============================
const KELIME_HAVUZU = [
    {
        kelime: 'Teenni',
        anlam: 'Acele etmeme, ağırbaşlılıkla ve ölçüp biçerek davranma.',
        ornek: 'Baskıya göndermeden önce tasarımı biraz teenniyle gözden geçirmek iyi olur.'
    },
    {
        kelime: 'İntiba',
        anlam: 'Bir kimse veya şey üzerinde bırakılan ilk izlenim, etki.',
        ornek: 'Sayfanın ilk açılışındaki renk dengesi kullanıcıda güçlü bir intiba bırakıyor.'
    },
    {
        kelime: 'Nüans',
        anlam: 'İki renk, ses veya anlam arasındaki küçük ama belirleyici ayrıntı.',
        ornek: 'Koyu zeminde iki ton arasındaki ince nüans tasarımı bambaşka bir yere taşıyor.'
    },
    {
        kelime: 'Mütemadiyen',
        anlam: 'Sürekli olarak, ara vermeden, durmaksızın.',
        ornek: 'Gün boyunca yeni işler mütemadiyen sıraya giriyor.'
    },
    {
        kelime: 'Vukuf',
        anlam: 'Bir konuyu derinlemesine bilme, hâkim olma.',
        ornek: 'Kullandığın araçlara tam vukufiyet sağladığında iş çok daha akıcı ilerliyor.'
    },
    {
        kelime: 'Sükûnet',
        anlam: 'Sessizlik, dinginlik ve iç huzuru.',
        ornek: 'Günün en yoğun saatinden sonra gelen o sükûnet insana iyi geliyor.'
    },
    {
        kelime: 'İtimat',
        anlam: 'Güvenme, inanma, birine dayanma.',
        ornek: 'Zamanında teslim edilen her iş müşterinin ekibe olan itimadını artırıyor.'
    },
    {
        kelime: 'Ahenk',
        anlam: 'Birbirine uyan parçaların oluşturduğu düzenli ve hoş bütünlük.',
        ornek: 'Menü, kartlar ve tipografi arasındaki ahenk arayüzü yorucu olmaktan çıkarıyor.'
    },
    {
        kelime: 'İtimam',
        anlam: 'Bir işe özen gösterme, titizlikle eğilme.',
        ornek: 'Kesim paylarına gösterilen itimam baskı kalitesini doğrudan belli ediyor.'
    },
    {
        kelime: 'Sebat',
        anlam: 'Sözünde veya kararında durma, vazgeçmeden sürdürme.',
        ornek: 'Küçük adımlarla da olsa sürdürülen sebat uzun vadede en sağlam sonucu veriyor.'
    }
];

function gununKelimesiniYukle() {
    if (window.innerWidth <= 768) return;

    const kutuEl = document.getElementById('gunun-kelimesi-kutu');
    const kelimeEl = document.getElementById('gunun-kelimesi');
    const anlamEl = document.getElementById('gunun-kelime-anlam');
    const ornekEl = document.getElementById('gunun-kelime-ornek');

    if (!kutuEl || !kelimeEl || !anlamEl || !ornekEl || KELIME_HAVUZU.length === 0) return;

    const simdi = new Date();
    const gunBaslangic = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
    const gunIndex = Math.floor(gunBaslangic.getTime() / (1000 * 60 * 60 * 24));
    const secilen = KELIME_HAVUZU[Math.abs(gunIndex) % KELIME_HAVUZU.length];

    kelimeEl.textContent = secilen.kelime;
    anlamEl.textContent = secilen.anlam;
    ornekEl.textContent = `“${secilen.ornek}”`;
}

// ==============================
// SABİTLER VE VERİ YÖNETİMİ
// ==============================
const ANAHTAR = 'finbuddy-islemler';
const IS_ANAHTAR = 'matbaa-isler';
const TEMA_ANAHTAR = 'finbuddy-tema';
const HEDEF_ANAHTAR = 'matbaa-gunluk-hedef';

let islemler = [];
let matbaaIsleri = [];
let gunlukHedef = 2500;

function verileriYukle() {
    try {
        const kayitliIslemler = JSON.parse(localStorage.getItem(ANAHTAR));
        islemler = Array.isArray(kayitliIslemler) ? kayitliIslemler : [];
    } catch (e) {
        islemler = [];
    }

    try {
        const kayitliIsler = JSON.parse(localStorage.getItem(IS_ANAHTAR));
        matbaaIsleri = Array.isArray(kayitliIsler) ? kayitliIsler : [];
    } catch (e) {
        matbaaIsleri = [];
    }

    // Eski kayıtlarla uyumluluk için eksik alanları tamamla
    islemler.forEach((islem, idx) => {
        if (!islem.id) islem.id = 'FIN-' + Date.now() + '-' + idx;
        if (!islem.saat) islem.saat = '--:--';
    });

    matbaaIsleri.forEach(is => {
        if (!is.oncelik) is.oncelik = 'normal';
        if (is.ucret === undefined) is.ucret = 0;
        if (is.piyasaDegeri === undefined) is.piyasaDegeri = 0;
        if (is.telefon === undefined) is.telefon = '';
        if (is.teslimKonum === undefined) is.teslimKonum = '';
        if (is.onayBeklemeGun === undefined || is.onayBeklemeGun === null) is.onayBeklemeGun = 4;
        if (!is.olusturmaTarihi) is.olusturmaTarihi = yerelTarihStr();
        if (is.not === undefined) is.not = '';
        if (is.revizyonNotu === undefined) is.revizyonNotu = '';
        if (is.basimDetay === undefined) {
            is.basimDetay = { makine: '', operator: '', ekNot: '' };
        }
    });

    const kayitliHedef = parseFloat(localStorage.getItem(HEDEF_ANAHTAR));
    if (!isNaN(kayitliHedef) && kayitliHedef > 0) {
        gunlukHedef = kayitliHedef;
    }
}

function kaydet() {
    try {
        localStorage.setItem(ANAHTAR, JSON.stringify(islemler));
        localStorage.setItem(IS_ANAHTAR, JSON.stringify(matbaaIsleri));
        localStorage.setItem(HEDEF_ANAHTAR, String(gunlukHedef));
    } catch (e) {
        toastGoster('Veriler tarayıcı hafızasına kaydedilemedi!', 'hata');
    }
}

// ==============================
// TARİH VE NAVİGASYON
// ==============================
const tarihEl = document.getElementById('guncel-tarih');
const bugunTarihStr = yerelTarihStr();

if (tarihEl) {
    tarihEl.textContent = new Date().toLocaleDateString('tr-TR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

const tarihInput = document.getElementById('secilen-tarih');
if (tarihInput) {
    tarihInput.value = bugunTarihStr;
}

const sayfaBasliklari = {
    'anasayfa': 'Ana Sayfa - Yeni İş Girişi',
    'grafik': 'Grafik & Tasarım Stüdyosu',
    'basim': 'Basım Parkuru',
    'teslim': 'Teslimat & Sevkiyat',
    'ciro': 'Günlük & Aylık Ciro Raporu',
    'ayarlar': 'Uygulama Ayarları'
};

function sayfaGoster(sayfaId) {
    document.querySelectorAll('.sayfa').forEach(s => s.classList.remove('aktif'));

    const acilacakSayfa = document.getElementById('sayfa-' + sayfaId) || document.getElementById(sayfaId);
    if (acilacakSayfa) {
        acilacakSayfa.classList.add('aktif');
    }

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.sayfa === sayfaId);
    });

    yaz('sayfa-baslik', sayfaBasliklari[sayfaId] || '');

    if (sayfaId === 'basim') {
        basimSecimListesiniGuncelle();
    }

    if (sayfaId === 'ciro') {
        ekraniTazele();
    }
}

function secilenTarihiAl() {
    const el = document.getElementById('secilen-tarih');
    return (el && el.value) ? el.value : yerelTarihStr();
}

function gunDegistir(fark) {
    const mevcut = secilenTarihiAl();
    const parcalar = mevcut.split('-').map(Number);
    const tarih = new Date(parcalar[0], parcalar[1] - 1, parcalar[2]);
    tarih.setDate(tarih.getDate() + fark);
    if (tarihInput) {
        tarihInput.value = yerelTarihStr(tarih);
        ekraniTazele();
    }
}

function buguneGit() {
    if (tarihInput) {
        tarihInput.value = yerelTarihStr();
        ekraniTazele();
    }
}

// ==============================
// CİRO VE KASA İŞLEMLERİ (GÜNLÜK + AYLIK)
// ==============================
function gunlukToplam(tur, hedefTarih = null) {
    const tarih = hedefTarih || secilenTarihiAl();
    return islemler
        .filter(i => i.tur === tur && i.tarih === tarih)
        .reduce((t, i) => t + (Number(i.miktar) || 0), 0);
}

function aylikToplam(tur, hedefTarih = null) {
    const tarih = hedefTarih || secilenTarihiAl();
    const ayKodu = tarih.slice(0, 7); // YYYY-MM
    return islemler
        .filter(i => i.tur === tur && typeof i.tarih === 'string' && i.tarih.startsWith(ayKodu))
        .reduce((t, i) => t + (Number(i.miktar) || 0), 0);
}

function islemEkle(tur, kategori, miktar, ozelTarih = null) {
    if (isNaN(miktar) || miktar <= 0) {
        toastGoster('Lütfen geçerli bir tutar giriniz.', 'hata');
        return false;
    }

    const tarih = ozelTarih || secilenTarihiAl();
    islemler.push({
        id: 'FIN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        tur: tur,
        kategori: kategori,
        miktar: Number(miktar),
        tarih: tarih,
        saat: simdikiSaatStr()
    });

    kaydet();
    ekraniTazele();
    return true;
}

function gelir() {
    const girdi = document.getElementById('gelir-girdi');
    const aciklamaEl = document.getElementById('gelir-aciklama');
    const aciklama = aciklamaEl.value.trim() || 'Günlük Tahsilat';

    if (islemEkle('gelir', aciklama, parseFloat(girdi.value))) {
        girdi.value = '';
        aciklamaEl.value = '';
        toastGoster('Gelir kasaya eklendi.', 'basari');
    }
}

function giden() {
    const girdi = document.getElementById('gider-girdi');
    const aciklamaEl = document.getElementById('gider-aciklama');
    const aciklama = aciklamaEl.value.trim() || 'Günlük Harcama';

    if (islemEkle('gider', aciklama, parseFloat(girdi.value))) {
        girdi.value = '';
        aciklamaEl.value = '';
        toastGoster('Gider kasaya işlendi.', 'bilgi');
    }
}

function kasaIslemiSil(id) {
    if (!confirm('Bu kasa kaydını silmek istediğinize emin misiniz?')) return;
    islemler = islemler.filter(i => i.id !== id);
    kaydet();
    ekraniTazele();
    toastGoster('Kasa kaydı silindi.', 'bilgi');
}

function kasaGecmisiniCiz() {
    const liste = document.getElementById('kasa-gecmis-liste');
    if (!liste) return;

    const secilenTarih = secilenTarihiAl();
    const gununIslemleri = islemler.filter(i => i.tarih === secilenTarih).slice().reverse();

    yaz('islem-adet-bilgi', `Seçili günde ${gununIslemleri.length} işlem`);

    if (gununIslemleri.length === 0) {
        liste.innerHTML = `<div class="bos-durum"><i class="fa-solid fa-receipt"></i>Bu tarihte henüz gelir veya gider kaydı yok.</div>`;
        return;
    }

    liste.innerHTML = gununIslemleri.map(i => `
        <div class="kasa-satir ${i.tur === 'gider' ? 'gider' : ''}">
            <div class="kasa-satir-sol">
                <span class="kasa-kat">${escapeHTML(i.kategori)}</span>
                <span class="kasa-saat"><i class="fa-regular fa-clock"></i> ${escapeHTML(i.saat)} • ${i.tur === 'gelir' ? 'Gelir' : 'Gider'}</span>
            </div>
            <div class="kasa-satir-sag">
                <span class="kasa-tutar ${i.tur === 'gelir' ? 'gelir-renk' : 'gider-renk'}">
                    ${i.tur === 'gelir' ? '+' : '-'}${para(i.miktar)}
                </span>
                <button type="button" class="btn-kucuk-ikon sil" onclick="kasaIslemiSil('${escapeHTML(i.id)}')" title="Kaydı Sil">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ==============================
// MATBAA İŞ TAKİP İŞLEMLERİ
// ==============================
function benzersizIsIdUret() {
    let yeniId;
    do {
        yeniId = 'IS-' + Math.floor(1000 + Math.random() * 9000);
    } while (matbaaIsleri.some(i => i.id === yeniId));
    return yeniId;
}

function yeniMatbaaIsiEkle() {
    const musteri = document.getElementById('yeni-musteri').value.trim();
    const telefon = document.getElementById('yeni-telefon').value.trim();
    const ad = document.getElementById('yeni-is-adi').value.trim();
    const grafiker = document.getElementById('yeni-grafiker').value.trim();
    const teslimKonum = document.getElementById('yeni-teslim-konum').value.trim();
    const onayBeklemeGun = Math.max(1, parseInt(document.getElementById('yeni-onay-gun').value, 10) || 4);
    const oncelik = document.getElementById('yeni-oncelik').value;
    const sure = document.getElementById('yeni-sure').value.trim();
    const ucret = parseFloat(document.getElementById('yeni-ucret').value) || 0;
    const piyasaDegeri = parseFloat(document.getElementById('yeni-piyasa-degeri').value) || 0;
    const baslangic = document.getElementById('yeni-baslangic').value.trim();
    const bitis = document.getElementById('yeni-bitis').value.trim();
    const not = document.getElementById('yeni-not').value.trim();
    const fotoIstiyor = document.getElementById('yeni-foto-istiyor').checked;

    if (!musteri || !ad || !grafiker) {
        toastGoster('Lütfen Müşteri, İş Adı ve Grafiker alanlarını doldurun.', 'hata');
        return;
    }

    matbaaIsleri.unshift({
        id: benzersizIsIdUret(),
        musteri: musteri,
        telefon: telefon,
        ad: ad,
        grafiker: grafiker,
        teslimKonum: teslimKonum,
        onayBeklemeGun: onayBeklemeGun,
        oncelik: oncelik,
        sure: sure || 'Belirtilmedi',
        ucret: ucret,
        piyasaDegeri: piyasaDegeri,
        baslangic: baslangic || 'Şimdi',
        bitis: bitis || 'Belirsiz',
        not: not,
        revizyonNotu: '',
        fotoIstiyor: fotoIstiyor,
        altDurum: 'Beklemede',
        asama: 'grafik',
        durum: 'normal',
        olusturmaTarihi: yerelTarihStr(),
        basimDetay: { makine: '', operator: '', ekNot: '' }
    });

    kaydet();
    ekraniTazele();

    document.getElementById('yeni-is-form').reset();
    document.getElementById('yeni-onay-gun').value = 4;
    fiyatKarsilastirmaGuncelle('yeni-ucret', 'yeni-piyasa-degeri', 'yeni-fiyat-karsilastirma');
    toastGoster('Yeni iş oluşturuldu ve Grafik Stüdyosuna gönderildi.', 'basari');
    sayfaGoster('grafik');
}

function isisSil(id) {
    if (!confirm('Bu işi kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    matbaaIsleri = matbaaIsleri.filter(i => i.id !== id);
    kaydet();
    ekraniTazele();
    toastGoster('İş silindi.', 'bilgi');
}

function altDurumGuncelle(id, yeniDurum) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (islem) {
        islem.altDurum = yeniDurum;
        kaydet();
        toastGoster(`${id} durumu "${yeniDurum}" olarak güncellendi.`, 'bilgi');
    }
}

function asamaDegistir(id, yeniAsama) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem) return;

    islem.asama = yeniAsama;
    islem.durum = 'normal';
    islem.revizyonNotu = '';
    islem.altDurum = yeniAsama === 'basim' ? 'Basıma Gönderildi' : (yeniAsama === 'teslim' ? 'Sevkiyata Hazır' : 'Beklemede');
    kaydet();
    ekraniTazele();
    basimSecimListesiniGuncelle();

    const asamaAd = yeniAsama === 'basim' ? 'Basım Parkuru' : 'Teslimat & Sevkiyat';
    toastGoster(`${id} → ${asamaAd} aşamasına aktarıldı.`, 'basari');
}

// ==============================
// BASIM KISMI MODÜLER FORMU
// ==============================
function basimSecimListesiniGuncelle() {
    const select = document.getElementById('basim-is-secim');
    if (!select) return;

    const oncekiDeger = select.value;
    const uygunIsler = matbaaIsleri.filter(i => i.asama !== 'tamamlandi');

    select.innerHTML = `<option value="">-- İş Seçin (${uygunIsler.length} aktif iş) --</option>` +
        uygunIsler.map(i => `<option value="${escapeHTML(i.id)}">${escapeHTML(i.id)} — ${escapeHTML(i.musteri)} (${escapeHTML(i.ad)})</option>`).join('');

    if (oncekiDeger && uygunIsler.some(i => i.id === oncekiDeger)) {
        select.value = oncekiDeger;
    }
}

function basimSecilenIsiDoldur() {
    const id = document.getElementById('basim-is-secim')?.value;
    const is = matbaaIsleri.find(i => i.id === id);
    if (!is) return;

    const detay = is.basimDetay || {};
    document.getElementById('basim-makine').value = detay.makine || '';
    document.getElementById('basim-operator').value = detay.operator || '';
    document.getElementById('basim-ek-not').value = detay.ekNot || '';
}

function basimKaydiEkle() {
    const secilenId = document.getElementById('basim-is-secim').value;
    const makine = document.getElementById('basim-makine').value.trim();
    const operator = document.getElementById('basim-operator').value.trim();
    const ekNot = document.getElementById('basim-ek-not').value.trim();

    if (!secilenId) {
        toastGoster('Lütfen işlem yapılacak işi seçin.', 'hata');
        return;
    }

    const is = matbaaIsleri.find(i => i.id === secilenId);
    if (!is) return;

    is.basimDetay = { makine, operator, ekNot };
    is.asama = 'basim';
    is.altDurum = 'Basıma Gönderildi';

    const ozetSatir = [
        makine ? `Makine: ${makine}` : '',
        operator ? `Operatör: ${operator}` : '',
        ekNot ? `Basım Notu: ${ekNot}` : ''
    ].filter(Boolean).join(' | ');

    if (ozetSatir) {
        is.not = is.not ? `${is.not}\n[Basım] ${ozetSatir}` : `[Basım] ${ozetSatir}`;
    }

    kaydet();
    ekraniTazele();
    basimSecimListesiniGuncelle();
    toastGoster(`${is.id} basım bilgileri kaydedildi ve Basım Parkuruna alındı.`, 'basari');
}

function isTeslimTamamla(id) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem) return;

    islem.asama = 'tamamlandi';
    islem.durum = 'normal';
    islem.altDurum = 'Tamamlandı';
    islem.teslimTarihi = yerelTarihStr();

    if (islem.ucret > 0) {
        if (confirm(`İş tutarı (${para(islem.ucret)}) bugünkü kasaya gelir olarak işlensin mi?`)) {
            islemEkle('gelir', `${islem.musteri} - ${islem.ad} (${islem.id})`, islem.ucret, yerelTarihStr());
        }
    }

    kaydet();
    ekraniTazele();
    toastGoster(`${id} teslim edildi olarak arşive alındı.`, 'basari');
}

function islemGeriAl(id) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem) return;

    const neden = prompt('Geri alma / revizyon nedeni (opsiyonel):', '');
    if (neden === null) return;

    islem.durum = 'hatali';
    islem.revizyonNotu = neden.trim();
    if (islem.asama === 'basim') islem.asama = 'grafik';
    else if (islem.asama === 'teslim') islem.asama = 'basim';
    else if (islem.asama === 'tamamlandi') islem.asama = 'teslim';

    islem.altDurum = 'Revizyonda';
    kaydet();
    ekraniTazele();
    toastGoster(`${id} revizyon için bir önceki aşamaya alındı.`, 'hata');
}

function hatayiDuzelt(id) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem) return;

    islem.durum = 'normal';
    islem.revizyonNotu = '';
    islem.altDurum = 'Beklemede';
    kaydet();
    ekraniTazele();
    toastGoster(`${id} üzerindeki hata durumu kaldırıldı.`, 'basari');
}

// ==============================
// İŞ DÜZENLEME MODALI
// ==============================
function modalAc(id) {
    const is = matbaaIsleri.find(i => i.id === id);
    if (!is) return;

    document.getElementById('edit-id').value = is.id;
    document.getElementById('edit-musteri').value = is.musteri;
    document.getElementById('edit-telefon').value = is.telefon || '';
    document.getElementById('edit-ad').value = is.ad;
    document.getElementById('edit-grafiker').value = is.grafiker;
    document.getElementById('edit-teslim-konum').value = is.teslimKonum || '';
    document.getElementById('edit-onay-gun').value = is.onayBeklemeGun || 4;
    document.getElementById('edit-oncelik').value = is.oncelik || 'normal';
    document.getElementById('edit-sure').value = is.sure || '';
    document.getElementById('edit-ucret').value = is.ucret || '';
    document.getElementById('edit-piyasa-degeri').value = is.piyasaDegeri || '';
    document.getElementById('edit-baslangic').value = is.baslangic || '';
    document.getElementById('edit-bitis').value = is.bitis || '';
    document.getElementById('edit-not').value = is.not || '';
    document.getElementById('edit-foto').checked = Boolean(is.fotoIstiyor);

    fiyatKarsilastirmaGuncelle('edit-ucret', 'edit-piyasa-degeri', 'edit-fiyat-karsilastirma');
    document.getElementById('duzenle-modal').classList.add('acik');
}

function modalKapat() {
    document.getElementById('duzenle-modal').classList.remove('acik');
}

function modalDisTikla(e) {
    if (e.target.id === 'duzenle-modal') modalKapat();
}

function isDuzenlemeKaydet() {
    const id = document.getElementById('edit-id').value;
    const is = matbaaIsleri.find(i => i.id === id);
    if (!is) return;

    const musteri = document.getElementById('edit-musteri').value.trim();
    const ad = document.getElementById('edit-ad').value.trim();
    const grafiker = document.getElementById('edit-grafiker').value.trim();

    if (!musteri || !ad || !grafiker) {
        toastGoster('Müşteri, İş Adı ve Grafiker boş bırakılamaz.', 'hata');
        return;
    }

    is.musteri = musteri;
    is.telefon = document.getElementById('edit-telefon').value.trim();
    is.ad = ad;
    is.grafiker = grafiker;
    is.teslimKonum = document.getElementById('edit-teslim-konum').value.trim();
    is.onayBeklemeGun = Math.max(1, parseInt(document.getElementById('edit-onay-gun').value, 10) || 4);
    is.oncelik = document.getElementById('edit-oncelik').value;
    is.sure = document.getElementById('edit-sure').value.trim() || 'Belirtilmedi';
    is.ucret = parseFloat(document.getElementById('edit-ucret').value) || 0;
    is.piyasaDegeri = parseFloat(document.getElementById('edit-piyasa-degeri').value) || 0;
    is.baslangic = document.getElementById('edit-baslangic').value.trim() || 'Şimdi';
    is.bitis = document.getElementById('edit-bitis').value.trim() || 'Belirsiz';
    is.not = document.getElementById('edit-not').value.trim();
    is.fotoIstiyor = document.getElementById('edit-foto').checked;

    kaydet();
    ekraniTazele();
    modalKapat();
    toastGoster(`${id} başarıyla güncellendi.`, 'basari');
}

// ==============================
// KART RENDER & FİLTRELEME
// ==============================
function asamaFiltrele(liste, aramaId, filtreId) {
    const aramaEl = document.getElementById(aramaId);
    const filtreEl = document.getElementById(filtreId);
    const q = aramaEl ? aramaEl.value.trim().toLowerCase() : '';
    const f = filtreEl ? filtreEl.value : 'hepsi';

    return liste
        .filter(i => {
            if (f === 'acil' && i.oncelik !== 'acil') return false;
            if (f === 'hatali' && i.durum !== 'hatali') return false;
            if (f === 'foto' && !i.fotoIstiyor) return false;
            if (!q) return true;
            const metin = `${i.id} ${i.musteri} ${i.telefon || ''} ${i.teslimKonum || ''} ${i.ad} ${i.grafiker} ${i.not || ''}`.toLowerCase();
            return metin.includes(q);
        })
        .sort((a, b) => {
            const skorA = (a.durum === 'hatali' ? 2 : 0) + (a.oncelik === 'acil' ? 1 : 0);
            const skorB = (b.durum === 'hatali' ? 2 : 0) + (b.oncelik === 'acil' ? 1 : 0);
            return skorB - skorA;
        });
}

function kartHTMLOlustur(i) {
    const fotoRozet = i.fotoIstiyor
        ? `<span class="kart-rozet foto-var"><i class="fa-solid fa-camera"></i> Fotoğraf İstiyor</span>`
        : `<span class="kart-rozet foto-yok">Fotoğraf Yok</span>`;

    const acilRozet = i.oncelik === 'acil'
        ? `<span class="kart-rozet acil"><i class="fa-solid fa-bolt"></i> ACİL</span>`
        : '';

    const ucretRozet = i.ucret > 0
        ? `<span class="kart-rozet ucret">${para(i.ucret)}</span>`
        : '';

    const onayGun = i.onayBeklemeGun || 4;
    const onaySonTarih = tarihGunEkleStr(i.olusturmaTarihi || yerelTarihStr(), onayGun);
    const onayRozet = `<span class="kart-rozet onay"><i class="fa-regular fa-hourglass-half"></i> Onay: ${onayGun} Gün (${onaySonTarih})</span>`;

    const karsilastirmaSatiri = (i.ucret > 0 || i.piyasaDegeri > 0)
        ? `<div class="kart-fiyat-karsilastirma"><span><i class="fa-solid fa-scale-balanced tema-ikon"></i> ${escapeHTML(fiyatKarsilastirmaMetni(i.ucret, i.piyasaDegeri))}</span></div>`
        : '';

    const notAlani = i.not
        ? `<div class="kart-not"><i class="fa-regular fa-note-sticky"></i> ${escapeHTML(i.not).replace(/\n/g, '<br>')}</div>`
        : '';

    const revizyonAlani = (i.durum === 'hatali' && i.revizyonNotu)
        ? `<div class="revizyon-notu"><i class="fa-solid fa-triangle-exclamation"></i> Revizyon: ${escapeHTML(i.revizyonNotu)}</div>`
        : '';

    const tamamlandiMi = i.asama === 'tamamlandi';

    return `
        <article class="matbaa-karti ${i.durum === 'hatali' ? 'hatali-kart' : ''} ${i.oncelik === 'acil' && !tamamlandiMi ? 'acil-kart' : ''} ${tamamlandiMi ? 'tamamlanan-kart' : ''}">
            <div class="kart-ust">
                <div class="kart-ust-sol">
                    <span class="kart-id">${escapeHTML(i.id)}</span>
                    ${acilRozet}
                    ${ucretRozet}
                    ${!tamamlandiMi ? onayRozet : ''}
                </div>
                <div class="kart-ust-sag">
                    ${fotoRozet}
                    <span class="kart-rozet ${i.durum === 'hatali' ? 'hatali' : 'normal'}">
                        ${tamamlandiMi ? 'Teslim Edildi' : (i.durum === 'hatali' ? 'Hatalı' : 'Aktif')}
                    </span>
                    <button type="button" class="btn-kucuk-ikon" onclick="modalAc('${escapeHTML(i.id)}')" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-kucuk-ikon sil" onclick="isisSil('${escapeHTML(i.id)}')" title="İşi Sil"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>

            <div class="kart-baslik">${escapeHTML(i.musteri)} — <strong>${escapeHTML(i.ad)}</strong></div>

            <div class="kart-detaylar">
                ${i.telefon ? `<div><i class="fa-solid fa-phone"></i> Telefon: <strong>${escapeHTML(i.telefon)}</strong></div>` : ''}
                ${i.teslimKonum ? `<div><i class="fa-solid fa-location-dot"></i> Teslim Konumu: <strong>${escapeHTML(i.teslimKonum)}</strong></div>` : ''}
                <div><i class="fa-solid fa-user-pen"></i> Grafiker: <strong>${escapeHTML(i.grafiker)}</strong></div>
                <div><i class="fa-solid fa-clock"></i> Süre: <strong>${escapeHTML(i.sure)}</strong></div>
                <div><i class="fa-solid fa-calendar-days"></i> Başla / Bitiş: <strong>${escapeHTML(i.baslangic)} → ${escapeHTML(i.bitis)}</strong></div>
            </div>

            ${karsilastirmaSatiri}
            ${notAlani}
            ${revizyonAlani}

            ${!tamamlandiMi ? `
                <div class="kart-durum-satir">
                    <span>İş Durumu:</span>
                    <select class="kart-durum-select" onchange="altDurumGuncelle('${escapeHTML(i.id)}', this.value)">
                        <option value="Beklemede" ${i.altDurum === 'Beklemede' ? 'selected' : ''}>Beklemede</option>
                        <option value="Revizyonda" ${i.altDurum === 'Revizyonda' ? 'selected' : ''}>Revizyonda</option>
                        <option value="Onay Bekliyor" ${i.altDurum === 'Onay Bekliyor' ? 'selected' : ''}>Onay Bekliyor</option>
                        <option value="Basıma Gönderildi" ${i.altDurum === 'Basıma Gönderildi' ? 'selected' : ''}>Basıma Gönderildi</option>
                        <option value="Sevkiyata Hazır" ${i.altDurum === 'Sevkiyata Hazır' ? 'selected' : ''}>Sevkiyata Hazır</option>
                        <option value="Tamamlandı" ${i.altDurum === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
                    </select>
                </div>
            ` : ''}

            <div class="kart-alt">
                ${i.asama === 'grafik' ? `
                    <button type="button" class="btn-is" onclick="asamaDegistir('${escapeHTML(i.id)}', 'basim')">Basıma Gönder <i class="fa-solid fa-arrow-right"></i></button>
                ` : ''}
                ${i.asama === 'basim' ? `
                    <button type="button" class="btn-geri" onclick="islemGeriAl('${escapeHTML(i.id)}')"><i class="fa-solid fa-rotate-left"></i> Geri Al</button>
                    <button type="button" class="btn-is" onclick="asamaDegistir('${escapeHTML(i.id)}', 'teslim')">Teslime Gönder <i class="fa-solid fa-arrow-right"></i></button>
                ` : ''}
                ${i.asama === 'teslim' ? `
                    <button type="button" class="btn-geri" onclick="islemGeriAl('${escapeHTML(i.id)}')"><i class="fa-solid fa-rotate-left"></i> Geri Al</button>
                    <button type="button" class="btn-basari" onclick="isTeslimTamamla('${escapeHTML(i.id)}')"><i class="fa-solid fa-check"></i> Teslim Edildi</button>
                ` : ''}
                ${tamamlandiMi ? `
                    <button type="button" class="btn-geri" onclick="islemGeriAl('${escapeHTML(i.id)}')"><i class="fa-solid fa-rotate-left"></i> Teslime Geri Al</button>
                    <span class="muted">Teslim: ${escapeHTML(i.teslimTarihi || '-')}</span>
                ` : ''}
                ${i.durum === 'hatali' ? `
                    <button type="button" class="btn-duzelt" onclick="hatayiDuzelt('${escapeHTML(i.id)}')"><i class="fa-solid fa-wrench"></i> Hatayı Düzelt</button>
                ` : ''}
            </div>
        </article>
    `;
}

function matbaaKartlariniCiz() {
    const grafikIsler = matbaaIsleri.filter(i => i.asama === 'grafik');
    const basimIsler = matbaaIsleri.filter(i => i.asama === 'basim');
    const teslimIsler = matbaaIsleri.filter(i => i.asama === 'teslim');
    const tamamlananIsler = matbaaIsleri.filter(i => i.asama === 'tamamlandi');

    yaz('badge-grafik', grafikIsler.length);
    yaz('badge-basim', basimIsler.length);
    yaz('badge-teslim', teslimIsler.length);

    yaz('grafik-sayac', `${grafikIsler.length} Aktif İş`);
    yaz('basim-sayac', `${basimIsler.length} Aktif İş`);
    yaz('teslim-sayac', `${teslimIsler.length} Aktif İş`);
    yaz('arsiv-sayac', `${tamamlananIsler.length} İş`);

    const aktifToplam = grafikIsler.length + basimIsler.length + teslimIsler.length;
    const hataliToplam = matbaaIsleri.filter(i => i.durum === 'hatali' && i.asama !== 'tamamlandi').length;
    yaz('ozet-aktif', aktifToplam);
    yaz('ozet-hatali', hataliToplam);
    yaz('ozet-tamamlanan', tamamlananIsler.length);

    const bugunNet = gunlukToplam('gelir', yerelTarihStr()) - gunlukToplam('gider', yerelTarihStr());
    yaz('ozet-ciro', para(bugunNet));

    const grafikFiltreli = asamaFiltrele(grafikIsler, 'arama-grafik', 'filtre-grafik');
    const basimFiltreli = asamaFiltrele(basimIsler, 'arama-basim', 'filtre-basim');
    const teslimFiltreli = asamaFiltrele(teslimIsler, 'arama-teslim', 'filtre-teslim');

    const listeDoldur = (elId, dizi, bosMesaj) => {
        const el = document.getElementById(elId);
        if (!el) return;
        if (dizi.length === 0) {
            el.innerHTML = `<div class="bos-durum"><i class="fa-regular fa-folder-open"></i>${bosMesaj}</div>`;
        } else {
            el.innerHTML = dizi.map(kartHTMLOlustur).join('');
        }
    };

    listeDoldur('grafik-liste', grafikFiltreli, 'Grafik aşamasında gösterilecek iş bulunmuyor.');
    listeDoldur('basim-liste', basimFiltreli, 'Basım parkurunda gösterilecek iş bulunmuyor.');
    listeDoldur('teslim-liste', teslimFiltreli, 'Teslimat aşamasında gösterilecek iş bulunmuyor.');
    listeDoldur('tamamlanan-liste', tamamlananIsler, 'Henüz teslim edilmiş arşiv iş bulunmuyor.');

    basimSecimListesiniGuncelle();
}

// ==============================
// TEMA, AYARLAR VE YEDEKLEME
// ==============================
function temaDegistir(temaAdi) {
    const secilenTema = temaAdi || 'varsayilan';
    document.documentElement.setAttribute('data-tema', secilenTema);
    const selectEl = document.getElementById('tema-select');
    if (selectEl && selectEl.value !== secilenTema) {
        selectEl.value = secilenTema;
    }
    try { localStorage.setItem(TEMA_ANAHTAR, secilenTema); } catch (e) {}
    ekraniTazele();
}

function hedefKaydet() {
    const input = document.getElementById('hedef-ayar-input');
    const yeniHedef = parseFloat(input.value);
    if (isNaN(yeniHedef) || yeniHedef <= 0) {
        toastGoster('Lütfen geçerli bir günlük hedef tutarı girin.', 'hata');
        return;
    }
    gunlukHedef = yeniHedef;
    kaydet();
    ekraniTazele();
    toastGoster(`Günlük hedef ${para(gunlukHedef)} olarak güncellendi.`, 'basari');
}

function verileriYedekle() {
    const yedek = {
        uygulama: 'MatbaaPro',
        tarih: new Date().toISOString(),
        gunlukHedef: gunlukHedef,
        islemler: islemler,
        matbaaIsleri: matbaaIsleri
    };

    const blob = new Blob([JSON.stringify(yedek, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matbaapro-yedek-${yerelTarihStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toastGoster('Yedek dosyası indirildi.', 'basari');
}

function yedekYukle(event) {
    const dosya = event.target.files[0];
    if (!dosya) return;

    const okuyucu = new FileReader();
    okuyucu.onload = function (e) {
        try {
            const veri = JSON.parse(e.target.result);
            if (!Array.isArray(veri.islemler) || !Array.isArray(veri.matbaaIsleri)) {
                throw new Error('Geçersiz dosya yapısı');
            }
            if (!confirm('Mevcut verilerin üzerine yedek dosya yüklenecek. Devam edilsin mi?')) return;

            islemler = veri.islemler;
            matbaaIsleri = veri.matbaaIsleri;
            if (veri.gunlukHedef > 0) gunlukHedef = veri.gunlukHedef;

            kaydet();
            ekraniTazele();
            const hedefInput = document.getElementById('hedef-ayar-input');
            if (hedefInput) hedefInput.value = gunlukHedef;
            toastGoster('Yedek başarıyla geri yüklendi.', 'basari');
        } catch (err) {
            toastGoster('Geçersiz yedek dosyası!', 'hata');
        }
        event.target.value = '';
    };
    okuyucu.readAsText(dosya);
}

function verileriSil() {
    if (confirm('Tüm veriler (finans ve matbaa işleri) kalıcı olarak silinecek. Emin misin?')) {
        islemler = [];
        matbaaIsleri = [];
        kaydet();
        ekraniTazele();
        toastGoster('Tüm veriler temizlendi.', 'bilgi');
    }
}

// ==============================
// GRAFİK (CHART.JS) VE EKRAN GÜNCELLEME
// ==============================
let grafik = null;

function grafikCiz(gelirToplam, giderToplam, net) {
    const canvas = document.getElementById('bakiyeGrafigi');
    if (!canvas || typeof Chart === 'undefined') return;

    const temaAna = cssDegisken('--tema-ana') || '#00a896';
    const hataRenk = cssDegisken('--hata-renk') || '#d54c4e';
    const yaziRenk = cssDegisken('--yazi-renk') || '#121212';
    const borderRenk = cssDegisken('--border-renk') || 'rgba(128,128,128,0.2)';
    const netRenk = net >= 0 ? '#0284c7' : hataRenk;

    const veri = [gelirToplam, giderToplam, net];

    if (grafik) {
        grafik.data.datasets[0].data = veri;
        grafik.data.datasets[0].backgroundColor = [temaAna, hataRenk, netRenk];
        grafik.options.plugins.title.color = yaziRenk;
        grafik.options.scales.x.ticks.color = yaziRenk;
        grafik.options.scales.y.ticks.color = yaziRenk;
        grafik.options.scales.y.grid.color = borderRenk;
        grafik.update();
        return;
    }

    grafik = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Gelir', 'Gider', 'Net Ciro'],
            datasets: [{
                data: veri,
                backgroundColor: [temaAna, hataRenk, netRenk],
                borderRadius: 10,
                maxBarThickness: 72
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Günlük Gelir / Gider Özeti (₺)',
                    color: yaziRenk,
                    font: { size: 15, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    ticks: { color: yaziRenk, font: { weight: '600' } },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: yaziRenk },
                    grid: { color: borderRenk }
                }
            }
        }
    });
}

function ekraniTazele() {
    const gelirToplam = gunlukToplam('gelir');
    const giderToplam = gunlukToplam('gider');
    const net = gelirToplam - giderToplam;

    const ayGelirToplam = aylikToplam('gelir');
    const ayGiderToplam = aylikToplam('gider');
    const ayNetCiro = ayGelirToplam - ayGiderToplam;

    yaz('toplam-gelen', para(gelirToplam));
    yaz('toplam-gider', para(giderToplam));
    yaz('net-bakiye', para(net));

    yaz('aylik-gelen', 'Aylık Gelen: ' + para(ayGelirToplam));
    yaz('aylik-gider', 'Aylık Giden: ' + para(ayGiderToplam));
    yaz('aylik-net-ciro', 'Aylık Net Ciro: ' + para(ayNetCiro));

    yaz('hedef-yazi', 'Hedef: ' + para(gunlukHedef));
    const yuzde = net > 0 ? Math.min(100, Math.round((net / gunlukHedef) * 100)) : 0;
    const bar = document.getElementById('hedef-bar');
    if (bar) bar.style.width = yuzde + '%';
    yaz('hedef-yuzde', '%' + yuzde + ' Tamamlandı');
    yaz('hedef-ilerleme-tutar', 'Mevcut: ' + para(Math.max(net, 0)));

    grafikCiz(gelirToplam, giderToplam, net);
    kasaGecmisiniCiz();
    matbaaKartlariniCiz();
}

// ==============================
// BAŞLANGIÇ KURULUMU
// ==============================
verileriYukle();

const kayitliTema = localStorage.getItem(TEMA_ANAHTAR);
if (kayitliTema) {
    document.documentElement.setAttribute('data-tema', kayitliTema);
    const selectEl = document.getElementById('tema-select');
    if (selectEl) selectEl.value = kayitliTema;
}

const hedefInputEl = document.getElementById('hedef-ayar-input');
if (hedefInputEl) {
    hedefInputEl.value = gunlukHedef;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modalKapat();
});

window.addEventListener('resize', gununKelimesiniYukle);

gununKelimesiniYukle();
ekraniTazele();
