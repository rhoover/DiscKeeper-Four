module.exports = function(meta) {

  let structuredData = {"@context": "https://schema.org", ...meta,};

  return `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;

};