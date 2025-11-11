/* Cubaclick SPA v2 — mejoras solicitadas
   - PIN admin: Cubaclick2020@*
   - Hero editable desde Admin
   - Sonido en botones
   - Dashboard de ventas por vendedor (productos, combos, remesas)
   - Reporte diario de bajo stock por WhatsApp
   - Deducción de stock por combos en checkout
*/

const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const state = {
  products: [],
  combos: [],
  categories: ["Carnes y embutidos","Bebidas","Desayunos","Chuche","Granos y pastas","Aseo","Ingredientes de cocina","Otros"],
  cart: [],
  sellers: [
    {name:"Vendedor 1", phone:"", id:"1"},
    {name:"Vendedor 2", phone:"", id:"2"},
    {name:"Vendedor 3", phone:"", id:"3"},
    {name:"Vendedor 4", phone:"", id:"4"},
  ],
  hero: {
    title: "Cubaclick",
    subtitle: "Productos • Combos • Remesas • Conócenos",
    image: "https://images.unsplash.com/photo-1556909114-16b5f5f2f934?q=80&w=1600&auto=format&fit=crop",
  },
  adminPhone: "5350000000", // destinatario del reporte diario
  rates: { usd_to_cup: 400, usd_to_mlc: 1, usd_to_usd: 1 },
  orders: [],      // {id, dateISO, sellerId, items:[{name,qty,price,type}], subtotal}
  remittances: [], // {id, dateISO, sellerId, usd, cup, mlc}
};

const STORAGE_KEY = "cubaclick_app_v2";
const ADMIN_PIN = "Cubaclick2020@*";

function save(){
  const data = {
    products:state.products, combos:state.combos, sellers:state.sellers, rates:state.rates,
    hero: state.hero, adminPhone: state.adminPhone, orders: state.orders, remittances: state.remittances
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){ seedDemo(); return; }
  try{
    const data = JSON.parse(raw);
    state.products = data.products || [];
    state.combos = data.combos || [];
    state.sellers = data.sellers || state.sellers;
    state.rates = data.rates || state.rates;
    state.hero = data.hero || state.hero;
    state.adminPhone = data.adminPhone || state.adminPhone;
    state.orders = data.orders || [];
    state.remittances = data.remittances || [];
  }catch(e){
    console.error("Error cargando datos", e);
    seedDemo();
  }
}

function seedDemo(){
  state.products = [
    {id:cid(), name:"Pollo 11 lb", price:15, stock:20, unit:"lb", category:"Carnes y embutidos", img:"https://images.unsplash.com/photo-1604908554007-3f3b4f54a9d1?q=80&w=1200&auto=format&fit=crop"},
    {id:cid(), name:"Huevo (30 u)", price:13, stock:5, unit:"cartón", category:"Desayunos", img:"https://images.unsplash.com/photo-1522184216315-dc2f7e6d1c73?q=80&w=1200&auto=format&fit=crop"},
    {id:cid(), name:"Arroz 5 lb", price:4.5, stock:12, unit:"lb", category:"Granos y pastas", img:"https://images.unsplash.com/photo-1604908553973-3c3a4f9bce43?q=80&w=1200&auto=format&fit=crop"},
    {id:cid(), name:"Aceite 1 L", price:3, stock:80, unit:"pomo", category:"Ingredientes de cocina", img:"https://images.unsplash.com/photo-1542042161784-26ab9e041e6e?q=80&w=1200&auto=format&fit=crop"},
    {id:cid(), name:"Puré de tomate (lata)", price:1.2, stock:40, unit:"lata", category:"Ingredientes de cocina", img:"https://images.unsplash.com/photo-1546549039-49e35b8d8e5d?q=80&w=1200&auto=format&fit=crop"},
    {id:cid(), name:"Spam (lata)", price:2.85, stock:22, unit:"lata", category:"Otros", img:"https://images.unsplash.com/photo-1514516430031-43a8f04c8f2a?q=80&w=1200&auto=format&fit=crop"},
    {id:cid(), name:"Cerdo 5 lb", price:25, stock:9, unit:"lb", category:"Carnes y embutidos", img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"},
  ];
  const comboId = cid();
  state.combos = [
    {id:comboId, title:"Combo #1", price:49.5, stock:10, items:[
      "5 lb de carne de cerdo","11 lb de pollo","5 lb de arroz","1 lata de puré","1 lata de spam","1 pomo de aceite","Regalo: 1 colcha"
    ],
    // Tabla de deducciones (mapea a IDs de productos y cantidades a descontar cuando se compra 1 combo)
    deducts:[
      // Nota: ajusta estos IDs al crear productos reales desde Admin
      // Este seed apunta a los productos demo por nombre.
    ], img:"https://images.unsplash.com/photo-1546549039-49e35b8d8e5d?q=80&w=1200&auto=format&fit=crop"},
  ];
  state.sellers = [
    {name:"Vendedor 1", phone:"5350000001", id:"1"},
    {name:"Vendedor 2", phone:"5350000002", id:"2"},
    {name:"Vendedor 3", phone:"5350000003", id:"3"},
    {name:"Vendedor 4", phone:"5350000004", id:"4"},
  ];
  state.rates = { usd_to_cup: 400, usd_to_mlc: 1, usd_to_usd: 1 };
  state.hero = {
    title:"Cubaclick",
    subtitle:"Productos • Combos • Remesas • Conócenos",
    image:"https://images.unsplash.com/photo-1556909114-16b5f5f2f934?q=80&w=1600&auto=format&fit=crop"
  };
  state.adminPhone = "5350000000";
  save();
}

function cid(){ return Math.random().toString(36).slice(2,10) }
function nowISO(){ return new Date().toISOString(); }
function formatUSD(n){ return `$${(n||0).toFixed(2)}` }

// ---------- Router ----------
function route(){
  const hash = location.hash || "#/";
  if(hash === "#/" || hash === "#") return renderHome();
  if(hash.startsWith("#/productos")) return renderProductos();
  if(hash.startsWith("#/combos")) return renderCombos();
  if(hash.startsWith("#/remesas")) return renderRemesas();
  if(hash.startsWith("#/conocenos")) return renderConocenos();
  if(hash.startsWith("#/admin")) return renderAdmin();
  renderHome();
}

function applyHero(){
  const hero = state.hero || {};
  const h = $("#hero");
  if(h){ h.style.setProperty("--hero", `url('${hero.image||""}')`); }
  const t = $("#heroTitle"); if(t) t.textContent = hero.title || "Cubaclick";
  const s = $("#heroSubtitle"); if(s) s.textContent = hero.subtitle || "";
}

function renderHome(){
  $("#app").innerHTML = `
    <section class="section">
      <h2>¡Bienvenid@ a Cubaclick!</h2>
      <p class="small">Toca un botón arriba para ver <strong>Productos</strong>, <strong>Combos</strong>, calcular <strong>Remesas</strong>, o saber más en <strong>Conócenos</strong>.</p>
    </section>
  `;
}

// ---------- Productos ----------
function renderProductos(){
  const cats = state.categories;
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const selCat = params.get("cat") || "Todas";

  const pills = ["Todas", ...cats].map(c=>`<button class="chip sfx ${c===selCat?'active':''}" data-cat="${c}">${c}</button>`).join("");
  const cards = state.products
    .filter(p => selCat==="Todas" || p.category===selCat)
    .map(p => `
      <article class="card">
        <img src="${p.img||''}" alt="${p.name}" />
        <div class="card__body">
          <h4>${p.name}</h4>
          <div class="badge">${p.unit||'unidad'} • <span class="stock">${p.stock} disp.</span></div>
          <div class="price">${formatUSD(p.price)}</div>
          <button class="btn sfx" data-add="${p.id}">Agregar</button>
        </div>
      </article>
    `).join("");

  $("#app").innerHTML = `
    <section class="section">
      <h2>Productos</h2>
      <div class="cat-filter">${pills}</div>
      <div class="grid">${cards || '<p class="small">No hay productos aún.</p>'}</div>
    </section>
  `;

  $$(".chip").forEach(b=>b.addEventListener("click", e=>{
    const c = e.currentTarget.getAttribute("data-cat");
    location.hash = `#/productos?cat=${encodeURIComponent(c)}`;
  }));

  $$('[data-add]').forEach(btn=>btn.addEventListener("click",()=>{
    sfx();
    const id = btn.getAttribute("data-add");
    const prod = state.products.find(x=>x.id===id);
    if(!prod) return;
    if(prod.stock<=0){ alert("Sin stock"); return; }
    addToCart({type:"product", id:prod.id, name:prod.name, price:prod.price, unit:prod.unit, qty:1, max:prod.stock});
  }));
}

// ---------- Combos ----------
function renderCombos(){
  const cards = state.combos.map(c => `
      <article class="card">
        <img src="${c.img||''}" alt="${c.title}" />
        <div class="card__body">
          <h4>${c.title}</h4>
          <div class="badge"># Combos • <span class="stock">${c.stock} disp.</span></div>
          <ul class="small" style="margin:.25rem 0 .5rem;padding-left:1rem;line-height:1.4">${(c.items||[]).map(i=>`<li>${i}</li>`).join("")}</ul>
          <div class="price">${formatUSD(c.price)}</div>
          <button class="btn sfx" data-add="${c.id}">Agregar</button>
        </div>
      </article>
  `).join("");

  $("#app").innerHTML = `
    <section class="section">
      <h2>Combos</h2>
      <div class="grid">${cards || '<p class="small">No hay combos aún.</p>'}</div>
    </section>
  `;

  $$('[data-add]').forEach(btn=>btn.addEventListener("click",()=>{
    sfx();
    const id = btn.getAttribute("data-add");
    const combo = state.combos.find(x=>x.id===id);
    if(!combo) return;
    if(combo.stock<=0){ alert("Sin stock"); return; }
    addToCart({type:"combo", id:combo.id, name:combo.title, price:combo.price, unit:"combo", qty:1, max:combo.stock});
  }));
}

// ---------- Remesas ----------
function renderRemesas(){
  $("#app").innerHTML = `
    <section class="section">
      <h2>Calculadora de remesas</h2>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="card">
          <div class="card__body">
            <label>Monto en USD
              <input id="remUSD" class="sfx" type="number" value="100" min="0" step="1" />
            </label>
            <div style="height:.5rem"></div>
            <table class="table">
              <thead><tr><th>Moneda</th><th>Equivale</th></tr></thead>
              <tbody>
                <tr><td>CUP</td><td id="remCUP">—</td></tr>
                <tr><td>MLC</td><td id="remMLC">—</td></tr>
                <tr><td>USD</td><td id="remUSDout">—</td></tr>
              </tbody>
            </table>
            <p class="small">Las tasas se configuran en <a href="#/admin">Admin</a>.</p>
            <div style="height:.5rem"></div>
            <label>Vendedor
              <select id="remSeller" class="sfx"></select>
            </label>
            <button id="remRegister" class="btn sfx" type="button">Registrar remesa</button>
          </div>
        </div>
        <div class="card">
          <div class="card__body">
            <h4>Cómo funciona</h4>
            <p class="small">Escribe el monto y verás la conversión a <strong>CUP</strong>, <strong>MLC</strong> y <strong>USD</strong>. Puedes registrar una remesa para llevar control por vendedor.</p>
          </div>
        </div>
      </div>
    </section>
  `;
  const remUSD = $("#remUSD");
  const remSeller = $("#remSeller");
  remSeller.innerHTML = state.sellers.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");

  const recalc = ()=>{
    const v = parseFloat(remUSD.value||"0");
    $("#remCUP").textContent = `${Math.round(v * state.rates.usd_to_cup).toLocaleString()} CUP`;
    $("#remMLC").textContent = `${(v * state.rates.usd_to_mlc).toFixed(2)} MLC`;
    $("#remUSDout").textContent = `${(v * state.rates.usd_to_usd).toFixed(2)} USD`;
  };
  remUSD.addEventListener("input", ()=>{ sfx(); recalc(); });
  recalc();

  $("#remRegister").addEventListener("click", ()=>{
    sfx();
    const v = parseFloat(remUSD.value||"0");
    if(!(v>0)) { alert("Monto inválido"); return; }
    const sellerId = remSeller.value;
    state.remittances.push({
      id: cid(), dateISO: nowISO(), sellerId,
      usd: v, cup: v*state.rates.usd_to_cup, mlc: v*state.rates.usd_to_mlc
    });
    save();
    alert("Remesa registrada.");
  });
}

// ---------- Conócenos ----------
function renderConocenos(){
  $("#app").innerHTML = `
    <section class="section">
      <h2>Conócenos</h2>
      <p>Cubaclick es alegría, entrega y soluciones a domicilio. Llevamos <strong>productos</strong>, <strong>combos</strong> y <strong>remesas</strong> hasta la puerta de tu familia.</p>
      <p class="small">Atendemos Manzanillo, Granma y zonas cercanas. ¡Gracias por preferirnos!</p>
    </section>
  `;
}

// ---------- Admin ----------
function renderAdmin(){
  if(!sessionStorage.getItem("admin_ok")){
    const pin = prompt("PIN de administrador:");
    if(pin !== ADMIN_PIN){ location.hash="#/"; return; }
    sessionStorage.setItem("admin_ok","1");
  }

  const sellerRows = state.sellers.map((s,i)=>`
    <tr>
      <td>${s.name}</td>
      <td><input class="sfx" data-seller-phone="${i}" placeholder="53xxxxxxxx" value="${s.phone||''}"/></td>
    </tr>
  `).join("");

  const productRows = state.products.map((p)=>`
    <tr>
      <td>${p.name}</td>
      <td>${p.category||'-'}</td>
      <td>${formatUSD(p.price)}</td>
      <td>${p.stock}</td>
      <td class="small">${p.unit||'-'}</td>
      <td>
        <button class="icon-btn sfx" data-edit-prod="${p.id}">Editar</button>
        <button class="icon-btn sfx" data-del-prod="${p.id}">Borrar</button>
      </td>
    </tr>
  `).join("");

  const comboRows = state.combos.map((c)=>`
    <tr>
      <td>${c.title}</td>
      <td>${formatUSD(c.price)}</td>
      <td>${c.stock}</td>
      <td class="small">${(c.items||[]).length} items</td>
      <td>
        <button class="icon-btn sfx" data-edit-combo="${c.id}">Editar</button>
        <button class="icon-btn sfx" data-del-combo="${c.id}">Borrar</button>
        <button class="icon-btn sfx" data-deduct-combo="${c.id}">Deducciones</button>
      </td>
    </tr>
  `).join("");

  const dash = buildDashboard();

  $("#app").innerHTML = `
    <section class="section">
      <h2>Panel de administración</h2>
      <div class="admin-grid">
        <div>
          <h3>Portada (hero)</h3>
          <div class="grid" style="grid-template-columns:1fr 1fr 1fr">
            <label>Título
              <input id="heroTitleInp" class="sfx" value="${state.hero.title||''}"/>
            </label>
            <label>Subtítulo
              <input id="heroSubInp" class="sfx" value="${state.hero.subtitle||''}"/>
            </label>
            <label>Imagen (URL)
              <input id="heroImgInp" class="sfx" value="${state.hero.image||''}"/>
            </label>
          </div>
          <div style="height:.5rem"></div>
          <label>WhatsApp del administrador (reportes)
            <input id="adminPhoneInp" class="sfx" value="${state.adminPhone||''}" placeholder="53xxxxxxxx"/>
          </label>
          <div style="height:.5rem"></div>
          <button id="saveHero" class="btn sfx">Guardar portada y admin</button>
          <button id="lowStockBtn" class="btn sfx">Enviar bajo stock por WhatsApp</button>
          <span id="saveMsg" class="small"></span>

          <h3 style="margin-top:1rem">Sellers / Vendedores (4)</h3>
          <table class="table">
            <thead><tr><th>Nombre</th><th>WhatsApp</th></tr></thead>
            <tbody>${sellerRows}</tbody>
          </table>

          <h3 style="margin-top:1rem">Tasas de remesas</h3>
          <div class="grid" style="grid-template-columns:repeat(3,1fr)">
            <label>CUP por USD
              <input id="rateCUP" class="sfx" type="number" min="0" step="1" value="${state.rates.usd_to_cup}" />
            </label>
            <label>MLC por USD
              <input id="rateMLC" class="sfx" type="number" min="0" step=".01" value="${state.rates.usd_to_mlc}" />
            </label>
            <label>USD por USD
              <input id="rateUSD" class="sfx" type="number" min="0" step=".01" value="${state.rates.usd_to_usd}" />
            </label>
          </div>
          <div style="height:.5rem"></div>
          <button id="saveAdmin" class="btn sfx">Guardar tasas</button>
        </div>

        <div>
          <h3>Acceso rápido</h3>
          <div class="grid" style="grid-template-columns:1fr 1fr">
            <a class="btn sfx" href="#/productos">Productos</a>
            <a class="btn sfx" href="#/combos">Combos</a>
            <a class="btn sfx" href="#/remesas">Remesas</a>
            <a class="btn sfx" href="#/">Inicio</a>
          </div>
          <div style="height:1rem"></div>

          <h3>Dashboard de ventas</h3>
          <div class="card"><div class="card__body small">
            ${dash}
          </div></div>

          <h3 style="margin-top:1rem">Productos</h3>
          <table class="table">
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Unidad</th><th></th></tr></thead>
            <tbody>${productRows||'<tr><td colspan="6" class="small">Sin productos</td></tr>'}</tbody>
          </table>
          <button id="addProd" class="btn sfx" style="margin-top:.5rem">Agregar producto</button>

          <h3 style="margin-top:1rem">Combos</h3>
          <table class="table">
            <thead><tr><th>Título</th><th>Precio</th><th>Stock</th><th>Items</th><th></th></tr></thead>
            <tbody>${comboRows||'<tr><td colspan="5" class="small">Sin combos</td></tr>'}</tbody>
          </table>
          <button id="addCombo" class="btn sfx" style="margin-top:.5rem">Agregar combo</button>
        </div>
      </div>
    </section>
  `;

  // Handlers
  $$('[data-seller-phone]').forEach(inp=>{
    inp.addEventListener("input", e=>{
      const idx = +e.currentTarget.getAttribute("data-seller-phone");
      state.sellers[idx].phone = e.currentTarget.value.trim();
    });
  });

  $("#saveHero").addEventListener("click", ()=>{
    sfx();
    state.hero.title = $("#heroTitleInp").value;
    state.hero.subtitle = $("#heroSubInp").value;
    state.hero.image = $("#heroImgInp").value;
    state.adminPhone = $("#adminPhoneInp").value;
    save(); applyHero();
    const m = $("#saveMsg"); m.textContent="Guardado ✓"; m.classList.add("success"); setTimeout(()=>m.textContent="", 1500);
  });

  $("#lowStockBtn").addEventListener("click", ()=>{
    sfx();
    const low = state.products.filter(p=>p.stock<=5);
    const lines = [];
    lines.push("*Stock bajo (≤5) — Cubaclick*");
    lines.push(new Date().toLocaleString());
    if(!low.length){ lines.push("_No hay productos con stock bajo._"); }
    else{
      low.forEach(p=>lines.push(`• ${p.name} — ${p.stock} ${p.unit||'u'}`));
    }
    const text = encodeURIComponent(lines.join("\n"));
    const tel = (state.adminPhone||"").replace(/\D/g,"");
    const url = `https://wa.me/${tel}?text=${text}`;
    window.open(url, "_blank");
  });

  $("#saveAdmin").addEventListener("click", ()=>{
    sfx();
    state.rates.usd_to_cup = Number($("#rateCUP").value||0);
    state.rates.usd_to_mlc = Number($("#rateMLC").value||0);
    state.rates.usd_to_usd = Number($("#rateUSD").value||0);
    save();
    const m = $("#saveMsg"); m.textContent="Tasas guardadas ✓"; m.classList.add("success"); setTimeout(()=>m.textContent="", 1500);
  });

  $$('[data-del-prod]').forEach(btn=>btn.addEventListener("click", ()=>{
    sfx();
    const id = btn.getAttribute("data-del-prod");
    if(confirm("¿Eliminar producto?")){
      state.products = state.products.filter(p=>p.id!==id);
      save(); renderAdmin();
    }
  }));

  $$('[data-edit-prod]').forEach(btn=>btn.addEventListener("click", ()=>{
    sfx();
    const id = btn.getAttribute("data-edit-prod");
    const p = state.products.find(x=>x.id===id);
    if(!p) return;
    const name = prompt("Nombre:", p.name) || p.name;
    const price = Number(prompt("Precio USD:", p.price) || p.price);
    const stock = Number(prompt("Stock:", p.stock) || p.stock);
    const unit = prompt("Unidad:", p.unit || "unidad") || p.unit;
    const category = prompt("Categoría:", p.category) || p.category;
    const img = prompt("URL imagen:", p.img || "") || p.img;
    Object.assign(p, {name, price, stock, unit, category, img});
    save(); renderAdmin();
  }));

  $("#addProd").addEventListener("click", ()=>{
    sfx();
    const name = prompt("Nombre del producto:");
    if(!name) return;
    const price = Number(prompt("Precio USD:", "1.00")||"0");
    const stock = Number(prompt("Stock disponible:", "10")||"0");
    const unit = prompt("Unidad (lb, kg, pomo, paquete...):","unidad") || "unidad";
    const category = prompt("Categoría:", state.categories[0]) || state.categories[0];
    const img = prompt("URL de la foto (opcional):","") || "";
    state.products.push({id:cid(), name, price, stock, unit, category, img});
    save(); renderAdmin();
  });

  $("#addCombo").addEventListener("click", ()=>{
    sfx();
    const title = prompt("Título del combo:","Combo nuevo");
    if(!title) return;
    const price = Number(prompt("Precio USD:","10")||"0");
    const stock = Number(prompt("Stock:","5")||"0");
    const itemsRaw = prompt("Items (separados por coma):","1 cartón de huevo, 2 lb de leche en polvo");
    const items = (itemsRaw||"").split(",").map(x=>x.trim()).filter(Boolean);
    const img = prompt("URL de la foto (opcional):","") || "";
    state.combos.push({id:cid(), title, price, stock, items, img, deducts:[]});
    save(); renderAdmin();
  });

  $$('[data-del-combo]').forEach(btn=>btn.addEventListener("click", ()=>{
    sfx();
    const id = btn.getAttribute("data-del-combo");
    if(confirm("¿Eliminar combo?")){
      state.combos = state.combos.filter(c=>c.id!==id);
      save(); renderAdmin();
    }
  }));

  $$('[data-edit-combo]').forEach(btn=>btn.addEventListener("click", ()=>{
    sfx();
    const id = btn.getAttribute("data-edit-combo");
    const c = state.combos.find(x=>x.id===id);
    if(!c) return;
    const title = prompt("Título:", c.title) || c.title;
    const price = Number(prompt("Precio USD:", c.price) || c.price);
    const stock = Number(prompt("Stock:", c.stock) || c.stock);
    const itemsRaw = prompt("Items (coma):", (c.items||[]).join(", ")) || (c.items||[]).join(", ");
    const items = itemsRaw.split(",").map(x=>x.trim()).filter(Boolean);
    const img = prompt("URL imagen:", c.img || "") || c.img;
    Object.assign(c, {title, price, stock, items, img});
    save(); renderAdmin();
  }));

  // Editor de deducciones de combo
  $$('[data-deduct-combo]').forEach(btn=>btn.addEventListener("click", ()=>{
    sfx();
    const id = btn.getAttribute("data-deduct-combo");
    const c = state.combos.find(x=>x.id===id);
    if(!c) return;
    alert("Configura deducciones seleccionando producto y cantidad. Repite hasta cancelar.");
    c.deducts = c.deducts || [];
    while(true){
      const list = state.products.map((p,idx)=>`${idx+1}. ${p.name} (stock ${p.stock})`).join("\n");
      const pick = prompt(`Elige producto (número):\n${list}\n(Cancelar para terminar)`);
      if(!pick) break;
      const idx = parseInt(pick,10)-1;
      if(isNaN(idx)||idx<0||idx>=state.products.length){ alert("Número inválido"); continue; }
      const qty = Number(prompt("Cantidad a descontar por 1 combo:", "1")||"0");
      if(!(qty>0)){ alert("Cantidad inválida"); continue; }
      const pid = state.products[idx].id;
      // si ya existe, reemplaza cantidad
      const ex = (c.deducts||[]).find(d=>d.productId===pid);
      if(ex){ ex.qty = qty; } else { c.deducts.push({productId:pid, qty}); }
      if(!confirm("¿Agregar otra deducción?")) break;
    }
    save(); renderAdmin();
  }));
}

// ---------- Carrito / Checkout ----------
function addToCart(item){
  const ex = state.cart.find(x=>x.type===item.type && x.id===item.id);
  if(ex){
    if(ex.qty < (ex.max ?? 9999)) ex.qty += 1;
  }else{
    state.cart.push({...item});
  }
  renderCartIcon();
  openCart();
  renderCart();
}
function removeFromCart(idx){
  state.cart.splice(idx,1);
  renderCartIcon();
  renderCart();
}
function changeQty(idx, v){
  const it = state.cart[idx];
  if(!it) return;
  it.qty = Math.max(1, Math.min(it.max||9999, Number(v)||1));
  renderCart();
}
function cartSubtotal(){
  return state.cart.reduce((a,c)=>a + (c.price * c.qty), 0);
}
function renderCartIcon(){
  $("#cartCount").textContent = String(state.cart.reduce((a,c)=>a+c.qty,0));
}

function openCart(){ $("#cartDrawer").classList.add("open"); $("#cartDrawer").setAttribute("aria-hidden","false"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#cartDrawer").setAttribute("aria-hidden","true"); }

function renderCart(){
  const cont = $("#cartItems");
  if(!state.cart.length){
    cont.innerHTML = `<p class="small">Tu carrito está vacío.</p>`;
  }else{
    cont.innerHTML = state.cart.map((c,idx)=>`
      <div class="card" style="flex-direction:row;gap:.75rem">
        <div class="card__body" style="flex:1">
          <h4>${c.name}</h4>
          <div class="small">${c.unit||""}</div>
          <div class="small">Precio: ${formatUSD(c.price)}</div>
          <div style="display:flex;gap:.5rem;align-items:center;margin-top:.5rem">
            <label class="small">Cant.
              <input type="number" min="1" max="${c.max||999}" value="${c.qty}" data-qty="${idx}" style="width:90px"/>
            </label>
            <strong>${formatUSD(c.price * c.qty)}</strong>
          </div>
        </div>
        <div style="display:flex;align-items:center;padding-right:.5rem">
          <button class="icon-btn sfx" data-del="${idx}">Eliminar</button>
        </div>
      </div>
    `).join("");
  }

  $("#subtotalUSD").textContent = formatUSD(cartSubtotal());

  const sel = $("#sellerSelect");
  sel.innerHTML = state.sellers.map(s=>`<option value="${s.id}">${s.name} (${s.phone||'sin número'})</option>`).join("");

  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const sellerParam = params.get("seller");
  if(sellerParam){ sel.value = sellerParam; }

  $$('[data-del]').forEach(b=>b.addEventListener("click",()=>{
    sfx();
    const idx = Number(b.getAttribute("data-del"));
    removeFromCart(idx);
  }));
  $$('[data-qty]').forEach(i=>i.addEventListener("input",()=>{
    sfx();
    const idx = Number(i.getAttribute("data-qty"));
    changeQty(idx, i.value);
  }));
}

function buildWhatsAppMessage({name,phone,address,note,sellerId}){
  const lines = [];
  lines.push("*Nuevo pedido Cubaclick*");
  lines.push("");
  lines.push("*Destinatario (tu familiar):* " + name);
  lines.push("*Teléfono:* " + phone);
  lines.push("*Dirección:* " + address);
  if(note) lines.push("*Nota:* " + note);
  lines.push("");
  lines.push("*Carrito:*");
  state.cart.forEach(c=>{
    lines.push(`• ${c.qty} × ${c.name} (${c.unit||'unidad'}) — ${formatUSD(c.price * c.qty)}`);
  });
  lines.push("");
  lines.push("*Subtotal:* " + formatUSD(cartSubtotal()));
  lines.push("");
  lines.push("_Generado desde la web_");
  const text = encodeURIComponent(lines.join("\n"));
  const seller = state.sellers.find(s=>s.id===sellerId) || state.sellers[0];
  const phoneDest = (seller?.phone||"").replace(/\D/g,"");
  const url = `https://wa.me/${phoneDest}?text=${text}`;
  return url;
}

function registerOrder(sellerId){
  const items = state.cart.map(c=>({type:c.type, name:c.name, qty:c.qty, price:c.price}));
  const subtotal = cartSubtotal();
  state.orders.push({id:cid(), dateISO:nowISO(), sellerId, items, subtotal});
  save();
}

// Deducción de stock en checkout (productos y combos)
function deductStockOnCheckout(){
  // productos simples
  state.cart.forEach(ci=>{
    if(ci.type==="product"){
      const p = state.products.find(x=>x.id===ci.id);
      if(p){ p.stock = Math.max(0, (p.stock||0) - ci.qty); }
    }
  });
  // combos
  state.cart.forEach(ci=>{
    if(ci.type==="combo"){
      const combo = state.combos.find(c=>c.id===ci.id);
      if(!combo) return;
      combo.stock = Math.max(0, (combo.stock||0) - ci.qty);
      const ded = (combo.deducts||[]);
      ded.forEach(d=>{
        const prod = state.products.find(p=>p.id===d.productId);
        if(prod){
          const totalDeduct = (d.qty||0) * ci.qty;
          prod.stock = Math.max(0, (prod.stock||0) - totalDeduct);
        }
      });
    }
  });
  save();
}

// ---------- Sonido ----------
let audioCtx;
function sfx(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = 520;
    g.gain.value = 0.02;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); setTimeout(()=>o.stop(), 60);
  }catch(e){ /* ignore */ }
}

// ---------- App bootstrap ----------
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", ()=>{
  $("#year").textContent = new Date().getFullYear();
  load(); applyHero(); route();
  renderCartIcon();

  // sonido para elementos .sfx
  document.body.addEventListener("click", (e)=>{
    if(e.target.closest(".sfx")) sfx();
  });

  $("#openCartBtn").addEventListener("click", ()=>{ sfx(); openCart(); });
  $("#closeCartBtn").addEventListener("click", ()=>{ sfx(); closeCart(); });

  $("#copySellerLink").addEventListener("click", ()=>{
    sfx();
    const sel = $("#sellerSelect").value;
    const url = `${location.origin}${location.pathname}#/productos?seller=${encodeURIComponent(sel)}`;
    navigator.clipboard.writeText(url).then(()=>{
      alert("Link copiado para el vendedor seleccionado.");
    });
  });

  $("#checkoutForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!state.cart.length){ alert("Agrega productos al carrito."); return; }
    const name = $("#recName").value.trim();
    const phone = $("#recPhone").value.trim();
    const address = $("#recAddress").value.trim();
    const note = $("#recNote").value.trim();
    const sellerId = $("#sellerSelect").value;
    if(!name || !phone || !address){ alert("Completa nombre, teléfono y dirección (de tu familiar)."); return; }
    // registrar venta y descontar stock
    registerOrder(sellerId);
    deductStockOnCheckout();
    // abrir WhatsApp
    const url = buildWhatsAppMessage({name,phone,address,note,sellerId});
    window.open(url, "_blank");
    // vaciar carrito
    state.cart = []; renderCartIcon(); renderCart();
    alert("Pedido registrado y enviado por WhatsApp.");
  });
});

// ---------- Dashboard ----------
function buildDashboard(){
  // ventas por vendedor
  const bySeller = {};
  state.sellers.forEach(s=>bySeller[s.id]={name:s.name, products:0, combos:0, remesasUSD:0, ventasUSD:0, orders:0});
  state.orders.forEach(o=>{
    const s = bySeller[o.sellerId]; if(!s) return;
    s.orders += 1;
    s.ventasUSD += o.subtotal;
    o.items.forEach(it=>{
      if(it.type==="product") s.products += it.qty;
      if(it.type==="combo") s.combos += it.qty;
    });
  });
  state.remittances.forEach(r=>{
    const s = bySeller[r.sellerId]; if(!s) return;
    s.remesasUSD += r.usd;
  });

  const rows = Object.entries(bySeller).map(([id, s])=>{
    return `<tr>
      <td>${s.name}</td>
      <td>${s.orders}</td>
      <td>${s.products}</td>
      <td>${s.combos}</td>
      <td>${s.remesasUSD.toFixed(2)} USD</td>
      <td>${s.ventasUSD.toFixed(2)} USD</td>
    </tr>`;
  }).join("");

  return `
    <table class="table small">
      <thead><tr><th>Vendedor</th><th>Órdenes</th><th>Unid. prod</th><th>Combos</th><th>Remesas</th><th>Ventas</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
