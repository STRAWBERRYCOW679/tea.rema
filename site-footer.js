(function () {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div>
      <p class="eyebrow">Our journey</p>
      <p>We started small and rough, but continued perfecting our skill and craftsmanship to give you the delicious meals that you love.</p>
    </div>
    <div>
      <p class="eyebrow">Contact us</p>
      <p><a href="tel:2347676767667">234+7676767667</a></p>
    </div>
    <div>
      <p class="eyebrow">Terms &amp; Conditions</p>
      <p>Orders are prepared fresh. Prices and availability may change. By ordering, you agree to our service terms.</p>
    </div>
  `;
  document.body.append(footer);
})();
