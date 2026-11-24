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

function netKarHesapla(ucret, maliyet) {
    return (Number(ucret) || 0) - (Number(maliyet) || 0);
}

function adetBirimFiyatHesapla(adetId, birimId, ucretId, maliyetId, hedefId) {
    const adetEl = document.getElementById(adetId);
    const birimEl = document.getElementById(birimId);
    const ucretEl = document.getElementById(ucretId);

    const adet = Math.max(1, parseInt(adetEl?.value, 10) || 1);
    const birimFiyat = parseFloat(birimEl?.value) || 0;

    if (birimFiyat > 0 && ucretEl) {
        const hesaplananToplam = Number((adet * birimFiyat).toFixed(2));
        ucretEl.value = hesaplananToplam;
    }

    fiyatKarsilastirmaGuncelle(ucretId, ucretId.replace('ucret', 'piyasa-degeri'), maliyetId, hedefId);
}

function fiyatKarsilastirmaMetni(ucret, piyasaDegeri, maliyet = 0, adet = 1, birimFiyat = 0) {
    const verilen = Number(ucret) || 0;
    const piyasa = Number(piyasaDegeri) || 0;
    const mal = Number(maliyet) || 0;
    const kar = netKarHesapla(verilen, mal);

    const parcalar = [];

    if (Number(adet) > 1 && Number(birimFiyat) > 0) {
        parcalar.push(`${Number(adet)} adet × ${para(birimFiyat)} = ${para(verilen)}`);
    } else if (verilen > 0) {
        parcalar.push(`Verilen: ${para(verilen)}`);
    }

    if (mal > 0 || verilen > 0) {
        const marj = verilen > 0 ? ` (%${((kar / verilen) * 100).toFixed(1)})` : '';
        parcalar.push(`Maliyet: ${para(mal)} → Net Kâr: ${para(kar)}${marj}`);
    }

    if (piyasa > 0 && verilen > 0) {
        const fark = piyasa - verilen;
        const oran = ((fark / piyasa) * 100).toFixed(1);
        if (fark > 0) {
            parcalar.push(`Piyasadan ${para(fark)} (%${oran}) uygun`);
        } else if (fark < 0) {
            const fazlaOran = ((Math.abs(fark) / piyasa) * 100).toFixed(1);
            parcalar.push(`Piyasanın ${para(Math.abs(fark))} (%${fazlaOran}) üzerinde`);
        } else {
            parcalar.push('Piyasa değeri ile aynı');
        }
    } else if (piyasa > 0) {
        parcalar.push(`Piyasa Değeri: ${para(piyasa)}`);
    }

    if (parcalar.length === 0) {
        return 'Adet, birim fiyat, tutar veya maliyet girildiğinde hesaplanır.';
    }

    return parcalar.join(' • ');
}

function fiyatKarsilastirmaGuncelle(ucretId, piyasaId, maliyetId, hedefId) {
    const hedef = document.getElementById(hedefId);
    if (!hedef) return;
    const ucret = parseFloat(document.getElementById(ucretId)?.value) || 0;
    const piyasa = parseFloat(document.getElementById(piyasaId)?.value) || 0;
    const maliyet = parseFloat(document.getElementById(maliyetId)?.value) || 0;
    const adetId = ucretId.replace('ucret', 'adet');
    const birimId = ucretId.replace('ucret', 'birim-fiyat');
    const adet = Math.max(1, parseInt(document.getElementById(adetId)?.value, 10) || 1);
    const birimFiyat = parseFloat(document.getElementById(birimId)?.value) || 0;

    hedef.innerHTML = `
        <span><i class="fa-solid fa-scale-balanced tema-ikon"></i> Fiyat &amp; Kâr Özeti:</span>
        <span>${escapeHTML(fiyatKarsilastirmaMetni(ucret, piyasa, maliyet, adet, birimFiyat))}</span>
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
const MUSTERI_ANAHTAR = 'matbaa-musteriler';
const TEMA_ANAHTAR = 'finbuddy-tema';
const HEDEF_ANAHTAR = 'matbaa-gunluk-hedef';

const GECERLI_ALT_DURUMLAR = ['Onay Bekliyor', 'Tamamlandı'];

let islemler = [];
let matbaaIsleri = [];
let musteriler = [];
let gunlukHedef = 2500;

function sonrakiMusteriKoduUret() {
    let maxNo = 0;
    musteriler.forEach(m => {
        const eslesme = String(m.kod || '').match(/^M-?(\d+)$/i);
        if (eslesme) {
            const num = parseInt(eslesme[1], 10);
            if (num > maxNo) maxNo = num;
        }
    });
    matbaaIsleri.forEach(is => {
        const eslesme = String(is.musteriKodu || '').match(/^M-?(\d+)$/i);
        if (eslesme) {
            const num = parseInt(eslesme[1], 10);
            if (num > maxNo) maxNo = num;
        }
    });
    return 'M-' + String(maxNo + 1).padStart(3, '0');
}

function musteriKaydiSagla(ad, telefon = '', ozelKod = '', not = '') {
    const temizAd = String(ad || '').trim();
    const temizTel = String(telefon || '').trim();
    const temizNot = String(not || '').trim();
    let kod = String(ozelKod || '').trim().toUpperCase();

    if (!temizAd && !kod) return '';

    let mevcut = musteriler.find(m =>
        (kod && m.kod.toUpperCase() === kod) ||
        (temizAd && m.ad.toLocaleLowerCase('tr') === temizAd.toLocaleLowerCase('tr'))
    );

    if (mevcut) {
        if (temizAd) mevcut.ad = temizAd;
        if (temizTel) mevcut.telefon = temizTel;
        if (temizNot) mevcut.not = temizNot;
        return mevcut.kod;
    }

    if (!kod) kod = sonrakiMusteriKoduUret();

    musteriler.push({
        kod: kod,
        ad: temizAd || kod,
        telefon: temizTel,
        not: temizNot,
        kayitTarihi: yerelTarihStr()
    });

    return kod;
}

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

    try {
        const kayitliMusteriler = JSON.parse(localStorage.getItem(MUSTERI_ANAHTAR));
        musteriler = Array.isArray(kayitliMusteriler) ? kayitliMusteriler : [];
    } catch (e) {
        musteriler = [];
    }

    islemler.forEach((islem, idx) => {
        if (!islem.id) islem.id = 'FIN-' + Date.now() + '-' + idx;
        if (!islem.saat) islem.saat = '--:--';
    });

    matbaaIsleri.forEach(is => {
        if (!is.oncelik) is.oncelik = 'normal';
        if (is.ucret === undefined) is.ucret = 0;
        if (is.adet === undefined || is.adet === null) is.adet = 1;
        if (is.birimFiyat === undefined || is.birimFiyat === null) {
            is.birimFiyat = is.adet > 0 && is.ucret > 0 ? Number((is.ucret / is.adet).toFixed(2)) : 0;
        }
        if (is.maliyet === undefined || is.maliyet === null) is.maliyet = 0;
        if (is.piyasaDegeri === undefined) is.piyasaDegeri = 0;
        if (is.telefon === undefined) is.telefon = '';
        if (is.teslimKonum === undefined) is.teslimKonum = '';
        if (is.onayBeklemeGun === undefined || is.onayBeklemeGun === null) is.onayBeklemeGun = 4;
        if (!is.olusturmaTarihi) is.olusturmaTarihi = yerelTarihStr();
        if (is.not === undefined) is.not = '';
        if (is.revizyonNotu === undefined) is.revizyonNotu = '';
        if (is.iptalNedeni === undefined) is.iptalNedeni = '';
        if (is.iptalTarihi === undefined) is.iptalTarihi = '';
        if (is.gelirKaydiId === undefined) is.gelirKaydiId = null;
        if (is.iptalDusumKaydiId === undefined) is.iptalDusumKaydiId = null;
        if (is.asama === 'iptal') {
            is.altDurum = 'İptal Edildi';
        } else if (!GECERLI_ALT_DURUMLAR.includes(is.altDurum)) {
            is.altDurum = is.asama === 'tamamlandi' ? 'Tamamlandı' : 'Onay Bekliyor';
        }
        if (is.basimDetay === undefined || is.basimDetay === null) {
            is.basimDetay = { makine: '', operator: '', ekNot: '' };
        }
        is.musteriKodu = musteriKaydiSagla(is.musteri, is.telefon, is.musteriKodu || '');
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
        localStorage.setItem(MUSTERI_ANAHTAR, JSON.stringify(musteriler));
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
    'iptal': 'İptal Edilen İşler',
    'musteriler': 'Müşteriler & Cari Hesaplar',
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

    if (sayfaId === 'musteriler') {
        musteriCarileriniCiz();
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
// MÜŞTERİ CARİ İŞLEMLERİ
// ==============================
function musteriKodundanDoldur() {
    const kodEl = document.getElementById('yeni-musteri-kodu');
    const adEl = document.getElementById('yeni-musteri');
    const telEl = document.getElementById('yeni-telefon');
    if (!kodEl) return;

    const aranan = kodEl.value.trim().toUpperCase();
    if (!aranan) return;

    const bulunan = musteriler.find(m => String(m.kod || '').toUpperCase() === aranan);
    if (bulunan) {
        if (adEl && !adEl.value.trim()) adEl.value = bulunan.ad;
        if (telEl && !telEl.value.trim() && bulunan.telefon) telEl.value = bulunan.telefon;
    }
}

function musteriAdindanKodEsles() {
    const kodEl = document.getElementById('yeni-musteri-kodu');
    const adEl = document.getElementById('yeni-musteri');
    const telEl = document.getElementById('yeni-telefon');
    if (!adEl || !kodEl) return;

    const ad = adEl.value.trim().toLocaleLowerCase('tr');
    if (!ad) {
        kodEl.value = '';
        return;
    }

    const bulunan = musteriler.find(m => String(m.ad || '').toLocaleLowerCase('tr') === ad);
    if (bulunan) {
        kodEl.value = bulunan.kod;
        if (telEl && !telEl.value.trim() && bulunan.telefon) telEl.value = bulunan.telefon;
    } else if (!kodEl.value.trim()) {
        kodEl.value = sonrakiMusteriKoduUret();
    }
}

function yeniMusteriEkle() {
    const kodInput = document.getElementById('cari-musteri-kodu');
    const adInput = document.getElementById('cari-musteri-ad');
    const telInput = document.getElementById('cari-musteri-tel');
    const notInput = document.getElementById('cari-musteri-not');

    const ad = adInput.value.trim();
    const tel = telInput.value.trim();
    const not = notInput.value.trim();
    const girilenKod = kodInput.value.trim().toUpperCase();

    if (!ad) {
        toastGoster('Lütfen firma veya müşteri adı girin.', 'hata');
        return;
    }

    if (girilenKod && musteriler.some(m => m.kod.toUpperCase() === girilenKod && m.ad.toLocaleLowerCase('tr') !== ad.toLocaleLowerCase('tr'))) {
        toastGoster(`${girilenKod} kodu başka bir müşteriye ait.`, 'hata');
        return;
    }

    const kayitliKod = musteriKaydiSagla(ad, tel, girilenKod, not);
    kaydet();
    musteriCarileriniCiz();
    yaz('badge-musteriler', musteriler.length);

    document.getElementById('yeni-musteri-form').reset();
    toastGoster(`${kayitliKod} — ${ad} cari kartı kaydedildi.`, 'basari');
}

function musteriCariOzetiHesapla(musteri) {
    const ilgiliIsler = matbaaIsleri.filter(i => {
        if (i.asama === 'iptal') return false;
        const kodEsles = musteri.kod && String(i.musteriKodu || '').toUpperCase() === String(musteri.kod).toUpperCase();
        const adEsles = String(i.musteri || '').trim().toLocaleLowerCase('tr') === String(musteri.ad || '').trim().toLocaleLowerCase('tr');
        return kodEsles || adEsles;
    });

    const toplamIsTutari = ilgiliIsler.reduce((top, i) => top + (Number(i.ucret) || 0), 0);
    const toplamMaliyet = ilgiliIsler.reduce((top, i) => top + (Number(i.maliyet) || 0), 0);

    const ilgiliTahsilatlar = islemler.filter(k => {
        if (k.tur !== 'gelir') return false;
        const kat = String(k.kategori || '').toLocaleLowerCase('tr');
        const ad = String(musteri.ad || '').toLocaleLowerCase('tr');
        const kod = String(musteri.kod || '').toLocaleLowerCase('tr');
        return (ad && kat.includes(ad)) || (kod && kat.includes(kod));
    });

    const toplamTahsilat = ilgiliTahsilatlar.reduce((top, k) => top + (Number(k.miktar) || 0), 0);
    const kalanBakiye = toplamIsTutari - toplamTahsilat;

    return {
        isSayisi: ilgiliIsler.length,
        toplamIsTutari,
        toplamMaliyet,
        toplamTahsilat,
        kalanBakiye
    };
}

function musteriCarileriniCiz() {
    const liste = document.getElementById('musteri-cari-liste');
    const aramaEl = document.getElementById('arama-musteri');
    yaz('badge-musteriler', musteriler.length);
    yaz('musteri-sayac', `${musteriler.length} Müşteri`);

    if (!liste) return;

    const q = aramaEl ? aramaEl.value.trim().toLowerCase() : '';
    const filtrelenmis = musteriler.filter(m => {
        if (!q) return true;
        return `${m.kod} ${m.ad} ${m.telefon || ''} ${m.not || ''}`.toLowerCase().includes(q);
    });

    if (filtrelenmis.length === 0) {
        liste.innerHTML = `<div class="bos-durum"><i class="fa-regular fa-address-book"></i>Gösterilecek müşteri cari kaydı bulunmuyor.</div>`;
        return;
    }

    liste.innerHTML = filtrelenmis.map(m => {
        const ozet = musteriCariOzetiHesapla(m);
        const bakiyeSinif = ozet.kalanBakiye > 0 ? 'kar-negatif' : 'kar-pozitif';
        const bakiyeEtiket = ozet.kalanBakiye > 0 ? 'Alacak (Kalan)' : (ozet.kalanBakiye < 0 ? 'Fazla Ödeme' : 'Kapalı / Sıfır');

        return `
            <article class="matbaa-karti">
                <div class="kart-ust">
                    <div class="kart-ust-sol">
                        <span class="kart-id">${escapeHTML(m.kod)}</span>
                        <span class="kart-rozet ucret">${ozet.isSayisi} İş</span>
                    </div>
                    <div class="kart-ust-sag">
                        <span class="kart-rozet ${bakiyeSinif}">${bakiyeEtiket}: ${para(Math.abs(ozet.kalanBakiye))}</span>
                    </div>
                </div>

                <div class="kart-baslik"><strong>${escapeHTML(m.ad)}</strong></div>

                <div class="kart-detaylar">
                    ${m.telefon ? `<div><i class="fa-solid fa-phone"></i> Telefon: <strong>${escapeHTML(m.telefon)}</strong></div>` : ''}
                    <div><i class="fa-solid fa-file-invoice-dollar"></i> Toplam İş Tutarı: <strong>${para(ozet.toplamIsTutari)}</strong></div>
                    <div><i class="fa-solid fa-hand-holding-dollar"></i> Toplam Tahsilat: <strong>${para(ozet.toplamTahsilat)}</strong></div>
                    <div><i class="fa-solid fa-scale-balanced"></i> Kalan Bakiye: <strong>${para(ozet.kalanBakiye)}</strong></div>
                </div>

                ${m.not ? `<div class="kart-not"><i class="fa-regular fa-note-sticky"></i> ${escapeHTML(m.not)}</div>` : ''}
            </article>
        `;
    }).join('');
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
    const ayKodu = tarih.slice(0, 7);
    return islemler
        .filter(i => i.tur === tur && typeof i.tarih === 'string' && i.tarih.startsWith(ayKodu))
        .reduce((t, i) => t + (Number(i.miktar) || 0), 0);
}

function islemEkle(tur, kategori, miktar, ozelTarih = null) {
    if (isNaN(miktar) || miktar <= 0) {
        toastGoster('Lütfen geçerli bir tutar giriniz.', 'hata');
        return null;
    }

    const kayitId = 'FIN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const tarih = ozelTarih || secilenTarihiAl();
    islemler.push({
        id: kayitId,
        tur: tur,
        kategori: kategori,
        miktar: Number(miktar),
        tarih: tarih,
        saat: simdikiSaatStr()
    });

    kaydet();
    ekraniTazele();
    return kayitId;
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
    const girilenKod = document.getElementById('yeni-musteri-kodu').value.trim();
    const musteri = document.getElementById('yeni-musteri').value.trim();
    const telefon = document.getElementById('yeni-telefon').value.trim();
    const ad = document.getElementById('yeni-is-adi').value.trim();
    const grafiker = document.getElementById('yeni-grafiker').value.trim();
    const adet = Math.max(1, parseInt(document.getElementById('yeni-adet').value, 10) || 1);
    const birimFiyat = parseFloat(document.getElementById('yeni-birim-fiyat').value) || 0;
    const teslimKonum = document.getElementById('yeni-teslim-konum').value.trim();
    const onayBeklemeGun = Math.max(1, parseInt(document.getElementById('yeni-onay-gun').value, 10) || 4);
    const oncelik = document.getElementById('yeni-oncelik').value;
    const sure = document.getElementById('yeni-sure').value.trim();
    const ucret = parseFloat(document.getElementById('yeni-ucret').value) || 0;
    const maliyet = parseFloat(document.getElementById('yeni-maliyet').value) || 0;
    const piyasaDegeri = parseFloat(document.getElementById('yeni-piyasa-degeri').value) || 0;
    const baslangic = document.getElementById('yeni-baslangic').value.trim();
    const bitis = document.getElementById('yeni-bitis').value.trim();
    const not = document.getElementById('yeni-not').value.trim();
    const fotoIstiyor = document.getElementById('yeni-foto-istiyor').checked;

    if (!musteri || !ad || !grafiker) {
        toastGoster('Lütfen Müşteri, İş Adı ve Grafiker alanlarını doldurun.', 'hata');
        return;
    }

    const musteriKodu = musteriKaydiSagla(musteri, telefon, girilenKod);

    matbaaIsleri.unshift({
        id: benzersizIsIdUret(),
        musteriKodu: musteriKodu,
        musteri: musteri,
        telefon: telefon,
        ad: ad,
        grafiker: grafiker,
        adet: adet,
        birimFiyat: birimFiyat,
        teslimKonum: teslimKonum,
        onayBeklemeGun: onayBeklemeGun,
        oncelik: oncelik,
        sure: sure || 'Belirtilmedi',
        ucret: ucret,
        maliyet: maliyet,
        piyasaDegeri: piyasaDegeri,
        baslangic: baslangic || 'Şimdi',
        bitis: bitis || 'Belirsiz',
        not: not,
        revizyonNotu: '',
        iptalNedeni: '',
        iptalTarihi: '',
        gelirKaydiId: null,
        iptalDusumKaydiId: null,
        fotoIstiyor: fotoIstiyor,
        altDurum: 'Onay Bekliyor',
        asama: 'grafik',
        durum: 'normal',
        olusturmaTarihi: yerelTarihStr(),
        basimDetay: { makine: '', operator: '', ekNot: '' }
    });

    kaydet();
    ekraniTazele();

    document.getElementById('yeni-is-form').reset();
    document.getElementById('yeni-adet').value = 1;
    document.getElementById('yeni-onay-gun').value = 4;
    fiyatKarsilastirmaGuncelle('yeni-ucret', 'yeni-piyasa-degeri', 'yeni-maliyet', 'yeni-fiyat-karsilastirma');
    toastGoster(`Yeni iş (${musteriKodu}) oluşturuldu ve Grafik Stüdyosuna gönderildi.`, 'basari');
    sayfaGoster('grafik');
}

function isisSil(id) {
    const is = matbaaIsleri.find(i => i.id === id);
    if (!is) return;
    if (!confirm('Bu işi kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    matbaaIsleri = matbaaIsleri.filter(i => i.id !== id);
    kaydet();
    ekraniTazele();
    toastGoster('İş silindi.', 'bilgi');
}

function altDurumGuncelle(id, yeniDurum) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem || islem.asama === 'iptal' || !GECERLI_ALT_DURUMLAR.includes(yeniDurum)) return;

    islem.altDurum = yeniDurum;
    kaydet();
    toastGoster(`${id} durumu "${yeniDurum}" olarak güncellendi.`, 'bilgi');
}

function asamaDegistir(id, yeniAsama) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem || islem.asama === 'iptal') return;

    if (yeniAsama === 'teslim') {
        const seciliBasimId = document.getElementById('basim-is-secim')?.value;
        if (seciliBasimId === id) {
            basimFormunuTemizle(true);
        }
    }

    islem.asama = yeniAsama;
    islem.durum = 'normal';
    islem.revizyonNotu = '';
    islem.altDurum = yeniAsama === 'tamamlandi' ? 'Tamamlandı' : 'Onay Bekliyor';
    kaydet();
    ekraniTazele();
    basimSecimListesiniGuncelle();

    const asamaAd = yeniAsama === 'basim' ? 'Basım Parkuru' : 'Teslimat & Sevkiyat';
    toastGoster(`${id} → ${asamaAd} aşamasına aktarıldı.`, 'basari');
}

function isIptalEt(id) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem || islem.asama === 'iptal') return;

    const neden = prompt('İptal nedeni (opsiyonel):', '');
    if (neden === null) return;

    const seciliBasimId = document.getElementById('basim-is-secim')?.value;
    if (seciliBasimId === id) {
        basimFormunuTemizle(true);
    }

    const iptalTarih = yerelTarihStr();
    const tutar = Number(islem.ucret) || 0;

    if (tutar > 0) {
        if (islem.gelirKaydiId) {
            const mevcutGelirIdx = islemler.findIndex(k => k.id === islem.gelirKaydiId);
            if (mevcutGelirIdx !== -1) {
                islemler.splice(mevcutGelirIdx, 1);
            } else {
                const dusumTarih = islem.teslimTarihi || iptalTarih;
                const dusumId = islemEkle('gider', `${islem.musteri} - ${islem.ad} (${islem.id}) [İptal Düşümü]`, tutar, dusumTarih);
                if (dusumId) islem.iptalDusumKaydiId = dusumId;
            }
            islem.gelirKaydiId = null;
        } else {
            const dusumId = islemEkle('gider', `${islem.musteri} - ${islem.ad} (${islem.id}) [İptal Düşümü]`, tutar, iptalTarih);
            if (dusumId) islem.iptalDusumKaydiId = dusumId;
        }
    }

    islem.asama = 'iptal';
    islem.durum = 'iptal';
    islem.altDurum = 'İptal Edildi';
    islem.iptalNedeni = neden.trim();
    islem.iptalTarihi = iptalTarih;
    islem.basimDetay = { makine: '', operator: '', ekNot: '' };

    kaydet();
    ekraniTazele();
    basimSecimListesiniGuncelle();
    toastGoster(`${id} iptal edildi; tutar günlük ve aylık cirodan düşüldü.`, 'hata');
}

// ==============================
// BASIM KISMI MODÜLER FORMU
// ==============================
function basimFormunuTemizle(secimiSifirla = false) {
    const select = document.getElementById('basim-is-secim');
    const makineEl = document.getElementById('basim-makine');
    const operatorEl = document.getElementById('basim-operator');
    const ekNotEl = document.getElementById('basim-ek-not');

    if (secimiSifirla && select) select.value = '';
    if (makineEl) makineEl.value = '';
    if (operatorEl) operatorEl.value = '';
    if (ekNotEl) ekNotEl.value = '';
}

function basimSecimListesiniGuncelle() {
    const select = document.getElementById('basim-is-secim');
    if (!select) return;

    const oncekiDeger = select.value;
    const uygunIsler = matbaaIsleri.filter(i => i.asama !== 'tamamlandi' && i.asama !== 'iptal');

    select.innerHTML = `<option value="">-- İş Seçin (${uygunIsler.length} aktif iş) --</option>` +
        uygunIsler.map(i => `<option value="${escapeHTML(i.id)}">${escapeHTML(i.id)} — ${escapeHTML(i.musteri)} (${escapeHTML(i.ad)})</option>`).join('');

    if (oncekiDeger && uygunIsler.some(i => i.id === oncekiDeger)) {
        select.value = oncekiDeger;
    } else {
        select.value = '';
        basimFormunuTemizle(false);
    }
}

function basimSecilenIsiDoldur() {
    const id = document.getElementById('basim-is-secim')?.value;
    const is = matbaaIsleri.find(i => i.id === id);
    if (!is || is.asama === 'tamamlandi' || is.asama === 'iptal') {
        basimFormunuTemizle(false);
        return;
    }

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
    if (!is || is.asama === 'iptal') return;

    is.basimDetay = { makine, operator, ekNot };
    is.asama = 'basim';
    is.altDurum = 'Onay Bekliyor';

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
    if (!islem || islem.asama === 'iptal') return;

    const seciliBasimId = document.getElementById('basim-is-secim')?.value;
    const teslimTarihi = yerelTarihStr();

    islem.asama = 'tamamlandi';
    islem.durum = 'normal';
    islem.altDurum = 'Tamamlandı';
    islem.teslimTarihi = teslimTarihi;
    islem.basimDetay = { makine: '', operator: '', ekNot: '' };

    if (seciliBasimId === id) {
        basimFormunuTemizle(true);
    }

    if (islem.ucret > 0) {
        if (confirm(`İş tutarı (${para(islem.ucret)}) bugünkü kasaya gelir olarak işlensin mi?`)) {
            const kodEk = islem.musteriKodu ? `[${islem.musteriKodu}] ` : '';
            const kayitId = islemEkle('gelir', `${kodEk}${islem.musteri} - ${islem.ad} (${islem.id})`, islem.ucret, teslimTarihi);
            if (kayitId) islem.gelirKaydiId = kayitId;
        }
    }

    kaydet();
    ekraniTazele();
    basimSecimListesiniGuncelle();
    toastGoster(`${id} teslim edildi ve basım form bilgileri temizlendi.`, 'basari');
}

function islemGeriAl(id) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem || islem.asama === 'iptal') return;

    const neden = prompt('Geri alma / iptal veya revizyon nedeni (opsiyonel):', '');
    if (neden === null) return;

    islem.durum = 'hatali';
    islem.revizyonNotu = neden.trim();
    if (islem.asama === 'basim') islem.asama = 'grafik';
    else if (islem.asama === 'teslim') islem.asama = 'basim';
    else if (islem.asama === 'tamamlandi') islem.asama = 'teslim';

    islem.altDurum = 'Onay Bekliyor';
    kaydet();
    ekraniTazele();
    toastGoster(`${id} bir önceki aşamaya alındı.`, 'hata');
}

function hatayiDuzelt(id) {
    const islem = matbaaIsleri.find(i => i.id === id);
    if (!islem || islem.asama !== 'basim') return;

    islem.durum = 'normal';
    islem.revizyonNotu = '';
    islem.altDurum = 'Onay Bekliyor';
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

    if (is.asama === 'iptal') {
        toastGoster('İptal edilen işlerde düzenleme yapılamaz.', 'hata');
        return;
    }

    document.getElementById('edit-id').value = is.id;
    document.getElementById('edit-musteri-kodu').value = is.musteriKodu || '';
    document.getElementById('edit-musteri').value = is.musteri;
    document.getElementById('edit-telefon').value = is.telefon || '';
    document.getElementById('edit-ad').value = is.ad;
    document.getElementById('edit-grafiker').value = is.grafiker;
    document.getElementById('edit-adet').value = is.adet || 1;
    document.getElementById('edit-birim-fiyat').value = is.birimFiyat || '';
    document.getElementById('edit-teslim-konum').value = is.teslimKonum || '';
    document.getElementById('edit-onay-gun').value = is.onayBeklemeGun || 4;
    document.getElementById('edit-oncelik').value = is.oncelik || 'normal';
    document.getElementById('edit-sure').value = is.sure || '';
    document.getElementById('edit-ucret').value = is.ucret || '';
    document.getElementById('edit-maliyet').value = is.maliyet || '';
    document.getElementById('edit-piyasa-degeri').value = is.piyasaDegeri || '';
    document.getElementById('edit-baslangic').value = is.baslangic || '';
    document.getElementById('edit-bitis').value = is.bitis || '';
    document.getElementById('edit-not').value = is.not || '';
    document.getElementById('edit-foto').checked = Boolean(is.fotoIstiyor);

    fiyatKarsilastirmaGuncelle('edit-ucret', 'edit-piyasa-degeri', 'edit-maliyet', 'edit-fiyat-karsilastirma');
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

    if (is.asama === 'iptal') {
        modalKapat();
        toastGoster('İptal edilen işlerde düzenleme yapılamaz.', 'hata');
        return;
    }

    const girilenKod = document.getElementById('edit-musteri-kodu').value.trim();
    const musteri = document.getElementById('edit-musteri').value.trim();
    const ad = document.getElementById('edit-ad').value.trim();
    const grafiker = document.getElementById('edit-grafiker').value.trim();

    if (!musteri || !ad || !grafiker) {
        toastGoster('Müşteri, İş Adı ve Grafiker boş bırakılamaz.', 'hata');
        return;
    }

    const telefon = document.getElementById('edit-telefon').value.trim();
    is.musteriKodu = musteriKaydiSagla(musteri, telefon, girilenKod);
    is.musteri = musteri;
    is.telefon = telefon;
    is.ad = ad;
    is.grafiker = grafiker;
    is.adet = Math.max(1, parseInt(document.getElementById('edit-adet').value, 10) || 1);
    is.birimFiyat = parseFloat(document.getElementById('edit-birim-fiyat').value) || 0;
    is.teslimKonum = document.getElementById('edit-teslim-konum').value.trim();
    is.onayBeklemeGun = Math.max(1, parseInt(document.getElementById('edit-onay-gun').value, 10) || 4);
    is.oncelik = document.getElementById('edit-oncelik').value;
    is.sure = document.getElementById('edit-sure').value.trim() || 'Belirtilmedi';
    is.ucret = parseFloat(document.getElementById('edit-ucret').value) || 0;
    is.maliyet = parseFloat(document.getElementById('edit-maliyet').value) || 0;
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
    const filtreEl = filtreId ? document.getElementById(filtreId) : null;
    const q = aramaEl ? aramaEl.value.trim().toLowerCase() : '';
    const f = filtreEl ? filtreEl.value : 'hepsi';

    return liste
        .filter(i => {
            if (f === 'acil' && i.oncelik !== 'acil') return false;
            if (f === 'hatali' && i.durum !== 'hatali') return false;
            if (f === 'foto' && !i.fotoIstiyor) return false;
            if (!q) return true;
            const metin = `${i.id} ${i.musteriKodu || ''} ${i.musteri} ${i.telefon || ''} ${i.teslimKonum || ''} ${i.ad} ${i.grafiker} ${i.not || ''} ${i.iptalNedeni || ''}`.toLowerCase();
            return metin.includes(q);
        })
        .sort((a, b) => {
            const skorA = (a.durum === 'hatali' ? 2 : 0) + (a.oncelik === 'acil' ? 1 : 0);
            const skorB = (b.durum === 'hatali' ? 2 : 0) + (b.oncelik === 'acil' ? 1 : 0);
            return skorB - skorA;
        });
}

function kartHTMLOlustur(i) {
    const iptalMi = i.asama === 'iptal';
    const tamamlandiMi = i.asama === 'tamamlandi';

    const fotoRozet = i.fotoIstiyor
        ? `<span class="kart-rozet foto-var"><i class="fa-solid fa-camera"></i> Fotoğraf İstiyor</span>`
        : `<span class="kart-rozet foto-yok">Fotoğraf Yok</span>`;

    const acilRozet = i.oncelik === 'acil' && !iptalMi
        ? `<span class="kart-rozet acil"><i class="fa-solid fa-bolt"></i> ACİL</span>`
        : '';

    const ucretRozet = i.ucret > 0
        ? `<span class="kart-rozet ucret">${para(i.ucret)}</span>`
        : '';

    const karDegeri = netKarHesapla(i.ucret, i.maliyet);
    const karRozet = (i.ucret > 0 || i.maliyet > 0)
        ? `<span class="kart-rozet ${karDegeri >= 0 ? 'kar-pozitif' : 'kar-negatif'}">Kâr: ${para(karDegeri)}</span>`
        : '';

    const onayGun = i.onayBeklemeGun || 4;
    const onaySonTarih = tarihGunEkleStr(i.olusturmaTarihi || yerelTarihStr(), onayGun);
    const onayRozet = (!tamamlandiMi && !iptalMi)
        ? `<span class="kart-rozet onay"><i class="fa-regular fa-hourglass-half"></i> Onay: ${onayGun} Gün (${onaySonTarih})</span>`
        : '';

    const karsilastirmaSatiri = (i.ucret > 0 || i.piyasaDegeri > 0 || i.maliyet > 0 || i.birimFiyat > 0)
        ? `<div class="kart-fiyat-karsilastirma"><span><i class="fa-solid fa-scale-balanced tema-ikon"></i> ${escapeHTML(fiyatKarsilastirmaMetni(i.ucret, i.piyasaDegeri, i.maliyet, i.adet, i.birimFiyat))}</span></div>`
        : '';

    const notAlani = i.not
        ? `<div class="kart-not"><i class="fa-regular fa-note-sticky"></i> ${escapeHTML(i.not).replace(/\n/g, '<br>')}</div>`
        : '';

    const revizyonAlani = (i.durum === 'hatali' && i.revizyonNotu && !iptalMi)
        ? `<div class="revizyon-notu"><i class="fa-solid fa-triangle-exclamation"></i> Revizyon: ${escapeHTML(i.revizyonNotu)}</div>`
        : '';

    const iptalAlani = iptalMi
        ? `<div class="revizyon-notu"><i class="fa-solid fa-ban"></i> İptal Edildi (${escapeHTML(i.iptalTarihi || '-')})${i.iptalNedeni ? ` — ${escapeHTML(i.iptalNedeni)}` : ''}</div>`
        : '';

    const aktifAltDurum = GECERLI_ALT_DURUMLAR.includes(i.altDurum) ? i.altDurum : 'Onay Bekliyor';

    const durumRozetSinif = iptalMi ? 'iptal' : (i.durum === 'hatali' ? 'hatali' : 'normal');
    const durumRozetMetin = iptalMi ? 'İptal Edildi' : (tamamlandiMi ? 'Teslim Edildi' : (i.durum === 'hatali' ? 'Hatalı' : 'Aktif'));

    return `
        <article class="matbaa-karti ${i.durum === 'hatali' && !iptalMi ? 'hatali-kart' : ''} ${i.oncelik === 'acil' && !tamamlandiMi && !iptalMi ? 'acil-kart' : ''} ${tamamlandiMi ? 'tamamlanan-kart' : ''} ${iptalMi ? 'iptal-kart' : ''}">
            <div class="kart-ust">
                <div class="kart-ust-sol">
                    <span class="kart-id">${escapeHTML(i.id)}</span>
                    ${i.musteriKodu ? `<span class="kart-rozet ucret">${escapeHTML(i.musteriKodu)}</span>` : ''}
                    ${acilRozet}
                    ${ucretRozet}
                    ${karRozet}
                    ${onayRozet}
                </div>
                <div class="kart-ust-sag">
                    ${fotoRozet}
                    <span class="kart-rozet ${durumRozetSinif}">${durumRozetMetin}</span>
                    ${!iptalMi ? `
                        <button type="button" class="btn-kucuk-ikon" onclick="modalAc('${escapeHTML(i.id)}')" title="Düzenle"><i class="fa-solid fa-pen"></i></button>
                    ` : ''}
                    <button type="button" class="btn-kucuk-ikon sil" onclick="isisSil('${escapeHTML(i.id)}')" title="İşi Sil"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>

            <div class="kart-baslik">${escapeHTML(i.musteri)} — <strong>${escapeHTML(i.ad)}</strong></div>

            <div class="kart-detaylar">
                <div><i class="fa-solid fa-cubes"></i> Adet: <strong>${escapeHTML(i.adet || 1)}</strong>${i.birimFiyat > 0 ? ` • Birim: <strong>${para(i.birimFiyat)}</strong>` : ''}</div>
                ${i.telefon ? `<div><i class="fa-solid fa-phone"></i> Telefon: <strong>${escapeHTML(i.telefon)}</strong></div>` : ''}
                ${i.teslimKonum ? `<div><i class="fa-solid fa-location-dot"></i> Teslim Konumu: <strong>${escapeHTML(i.teslimKonum)}</strong></div>` : ''}
                <div><i class="fa-solid fa-user-pen"></i> Grafiker: <strong>${escapeHTML(i.grafiker)}</strong></div>
                <div><i class="fa-solid fa-clock"></i> Süre: <strong>${escapeHTML(i.sure)}</strong></div>
                <div><i class="fa-solid fa-calendar-days"></i> Başla / Bitiş: <strong>${escapeHTML(i.baslangic)} → ${escapeHTML(i.bitis)}</strong></div>
            </div>

            ${karsilastirmaSatiri}
            ${notAlani}
            ${revizyonAlani}
            ${iptalAlani}

            ${(!tamamlandiMi && !iptalMi) ? `
                <div class="kart-durum-satir">
                    <span>İş Durumu:</span>
                    <select class="kart-durum-select" onchange="altDurumGuncelle('${escapeHTML(i.id)}', this.value)">
                        <option value="Onay Bekliyor" ${aktifAltDurum === 'Onay Bekliyor' ? 'selected' : ''}>Onay Bekliyor</option>
                        <option value="Tamamlandı" ${aktifAltDurum === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
                    </select>
                </div>
            ` : ''}

            <div class="kart-alt">
                ${i.asama === 'grafik' ? `
                    <button type="button" class="btn-is" onclick="asamaDegistir('${escapeHTML(i.id)}', 'basim')">Basıma Gönder <i class="fa-solid fa-arrow-right"></i></button>
                    <button type="button" class="btn-iptal" onclick="isIptalEt('${escapeHTML(i.id)}')"><i class="fa-solid fa-ban"></i> İptal Et</button>
                ` : ''}
                ${i.asama === 'basim' ? `
                    <button type="button" class="btn-geri" onclick="islemGeriAl('${escapeHTML(i.id)}')"><i class="fa-solid fa-rotate-left"></i> Geri Al</button>
                    <button type="button" class="btn-is" onclick="asamaDegistir('${escapeHTML(i.id)}', 'teslim')">Teslime Gönder <i class="fa-solid fa-arrow-right"></i></button>
                    <button type="button" class="btn-iptal" onclick="isIptalEt('${escapeHTML(i.id)}')"><i class="fa-solid fa-ban"></i> İptal Et</button>
                ` : ''}
                ${i.asama === 'teslim' ? `
                    <button type="button" class="btn-geri" onclick="islemGeriAl('${escapeHTML(i.id)}')"><i class="fa-solid fa-rotate-left"></i> Geri Al</button>
                    <button type="button" class="btn-basari" onclick="isTeslimTamamla('${escapeHTML(i.id)}')"><i class="fa-solid fa-check"></i> Teslim Edildi</button>
                    <button type="button" class="btn-iptal" onclick="isIptalEt('${escapeHTML(i.id)}')"><i class="fa-solid fa-ban"></i> İptal Et</button>
                ` : ''}
                ${tamamlandiMi ? `
                    <button type="button" class="btn-geri" onclick="islemGeriAl('${escapeHTML(i.id)}')"><i class="fa-solid fa-rotate-left"></i> Teslime Geri Al</button>
                    <button type="button" class="btn-iptal" onclick="isIptalEt('${escapeHTML(i.id)}')"><i class="fa-solid fa-ban"></i> İptal Et</button>
                    <span class="muted">Teslim: ${escapeHTML(i.teslimTarihi || '-')}</span>
                ` : ''}
                ${iptalMi ? `
                    <span class="muted">İptal Tarihi: ${escapeHTML(i.iptalTarihi || '-')} • Düzenleme Kapalı</span>
                ` : ''}
                ${(i.durum === 'hatali' && i.asama === 'basim') ? `
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
    const iptalIsler = matbaaIsleri.filter(i => i.asama === 'iptal');

    yaz('badge-grafik', grafikIsler.length);
    yaz('badge-basim', basimIsler.length);
    yaz('badge-teslim', teslimIsler.length);
    yaz('badge-iptal', iptalIsler.length);

    yaz('grafik-sayac', `${grafikIsler.length} Aktif İş`);
    yaz('basim-sayac', `${basimIsler.length} Aktif İş`);
    yaz('teslim-sayac', `${teslimIsler.length} Aktif İş`);
    yaz('arsiv-sayac', `${tamamlananIsler.length} İş`);
    yaz('iptal-sayac', `${iptalIsler.length} İş`);

    const aktifToplam = grafikIsler.length + basimIsler.length + teslimIsler.length;
    const hataliToplam = matbaaIsleri.filter(i => i.durum === 'hatali' && i.asama !== 'tamamlandi' && i.asama !== 'iptal').length;
    yaz('ozet-aktif', aktifToplam);
    yaz('ozet-basim', basimIsler.length);
    yaz('ozet-hatali', hataliToplam);
    yaz('ozet-tamamlanan', tamamlananIsler.length);

    const bugunNet = gunlukToplam('gelir', yerelTarihStr()) - gunlukToplam('gider', yerelTarihStr());
    yaz('ozet-ciro', para(bugunNet));

    const grafikFiltreli = asamaFiltrele(grafikIsler, 'arama-grafik', 'filtre-grafik');
    const basimFiltreli = asamaFiltrele(basimIsler, 'arama-basim', 'filtre-basim');
    const teslimFiltreli = asamaFiltrele(teslimIsler, 'arama-teslim', 'filtre-teslim');
    const iptalFiltreli = asamaFiltrele(iptalIsler, 'arama-iptal', null);

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
    listeDoldur('iptal-liste', iptalFiltreli, 'İptal edilmiş iş bulunmuyor.');

    basimSecimListesiniGuncelle();
    musteriCarileriniCiz();
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
        matbaaIsleri: matbaaIsleri,
        musteriler: musteriler
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
            musteriler = Array.isArray(veri.musteriler) ? veri.musteriler : [];
            if (veri.gunlukHedef > 0) gunlukHedef = veri.gunlukHedef;

            verileriYukle();
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
    if (confirm('Tüm veriler (finans, müşteri cari ve matbaa işleri) kalıcı olarak silinecek. Emin misin?')) {
        islemler = [];
        matbaaIsleri = [];
        musteriler = [];
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
