#import "@preview/cades:0.3.0": qr-code
#import "@preview/datify:0.1.3": custom-date-format
#let nbh = "‑"

// Truncate a number to 2 decimal places
// and add trailing zeros if necessary
// E.g. 1.234 -> 1.23, 1.2 -> 1.20
#let add-zeros = (num) => {
    // Can't use trunc and fract due to rounding errors
    let frags = str(num).split(".")
    let (intp, decp) = if frags.len() == 2 { frags } else { (num, "00") }
    str(intp) + "." + (str(decp) + "00").slice(0, 2)
  }

#let parse-date = (date-str) => {
  let parts = date-str.split("-")
  if parts.len() != 3 {
    panic(
      "Invalid date string: " + date-str + "\n" +
      "Expected format: YYYY-MM-DD"
    )
  }
  datetime(
    year: int(parts.at(0)),
    month: int(parts.at(1)),
    day: int(parts.at(2)),
  )
}

#let TODO = box(
  inset: (x: 0.5em),
  outset: (y: 0.2em),
  radius: 0.2em,
  fill: rgb(255,180,170),
)[
  #text(
    size: 0.8em,
    weight: 600,
    fill: rgb(100,68,64)
  )[TODO]
]

#let horizontalrule = [
  #v(8mm)
  #line(
    start: (20%,0%),
    end: (80%,0%),
    stroke: 0.8pt + gray,
  )
  #v(8mm)
]

#let signature-line = line(length: 5cm, stroke: 0.4pt)

#let endnote(num, contents) = [
  #stack(dir: ltr, spacing: 3pt, super[#num], contents)
]

#let grayish = rgb("#fafafa")
#let more-grayish = rgb("#f0f0f0")
#let text-primary = rgb("#0f0f0f")
#let text-secondary = rgb("#3c3c3c")

#let languages = (
    en: (
      id: "en",
      country: "GB",
      recipient: (
        title: "Recipient",
        name: "Name",
        phone: "Phone",
        email: "Email",
        address: "Address",
        vat: "VAT ID",
      ),
      biller: "Biller",
      invoice: "Invoice",
      cancellation-invoice: "Cancellation Invoice",
      cancellation-notice: (id, issuing-date) => [
        As agreed, you will receive a credit note
        for the invoice *#id* dated *#issuing-date*.
      ],
      invoice-id: "Invoice ID",
      issuing-date: "Issuing Date",
      delivery-date: "Delivery Date",
      items: "Items",
      number: "№",
      date: "Date",
      description: "Description",
      duration: "Duration",
      quantity: "Quantity",
      price: "Price",
      total-time: "Total working time",
      subtotal: "Subtotal",
      discount-of: "Discount of",
      vat: "VAT of",
      no-vat: "Not Subject to VAT",
      reverse-charge: "Reverse Charge",
      total: "Total",
      owner: "Owner",
      iban: "IBAN",
      bic: "BIC",
      qr-code-text: "You can scan the QR code below with your bank app to make the payment."
    ),
    fr: (
      id: "fr",
      country: "FR",
      recipient: (
        title: "Client",
        name: "Nom",
        phone: "Téléphone",
        email: "Email",
        address: "Adresse",
        vat: "TVA",
      ),
      biller: "Émetteur",
      invoice: "Facture",
      cancellation-invoice: "Note de crédit",
      cancellation-notice: (id, issuing-date) => [
        Comme convenu, vous recevrez un crédit
        pour la facture *#id* du *#issuing-date*.
      ],
      invoice-id: "Facture N°",
      issuing-date: "Date d'émission",
      delivery-date: "Date de livraison",
      items: "Détail",
      number: "N°",
      date: "Date",
      description: "Description",
      duration: "Durée",
      quantity: "Quantité",
      price: "Prix",
      total-time: "Temps total travaillé",
      subtotal: "Sous-total",
      discount-of: "Remise de",
      vat: "TVA",
      no-vat: "Non sujet à la TVA",
      reverse-charge: "Facturation inversée",
      total: "Total",
      owner: "Titulaire",
      iban: "IBAN",
      bic: "BIC",
      qr-code-text: "Vous pouvez scanner le QR code ci-dessous avec votre application de banque pour effectuer le paiement."
    ),
    de: (
      id: "de",
      country: "DE",
      recipient: (
        title: "Empfänger",
        name: "Name",
        phone: "Telefon",
        email: "Email",
        address: "Adresse",
        vat: "USt-IdNr.",
      ),
      biller: "Aussteller",
      invoice: "Rechnung",
      cancellation-invoice: "Stornorechnung",
      cancellation-notice: (id, issuing-date) => [
        Vereinbarungsgemäß erhalten Sie hiermit eine Gutschrift
        zur Rechnung *#id* vom *#issuing-date*.
      ],
      invoice-id: "Rechnungsnummer",
      issuing-date: "Ausstellungsdatum",
      delivery-date: "Lieferdatum",
      items: "Leistungen",
      number: "Nr",
      date: "Datum",
      description: "Beschreibung",
      duration: "Dauer",
      quantity: "Menge",
      price: "Preis",
      total-time: "Gesamtarbeitszeit",
      subtotal: "Zwischensumme",
      discount-of: "Rabatt von",
      vat: "Umsatzsteuer von",
      no-vat: "Nicht Umsatzsteuerpflichtig",
      reverse-charge: "Steuerschuldnerschaft des\nLeistungsempfängers",
      total: "Gesamt",
      owner: "Inhaber",
      iban: "IBAN",
      bic: "BIC",
      qr-code-text: "Sie können den QR-Code unten scannen, um den Betrag zu zahlen."
    ),
  )

#let invoice(
  language: "en",
  currency: "€",
  country: none,
  title: none,
  logo: none,
  invoice-id: none,
  cancellation: bool,
  issuing-date: none,
  delivery-date: none,
  biller: (:),
  recipient: (:),
  keywords: (),
  hourly-rate: none,
  styling: (:), // font, font-size, margin (sets defaults below)
  items: (),
  discount: none,
  vat: 0.2,
  data: none,
  override-translation: none,
  primary-color: rgb(255, 100, 100),
  footer-text: none,
  doc,
) = {
  // Set styling defaults
  styling.font = styling.at("font", default: "Arial")
  styling.font-size = styling.at("font-size", default: 11pt)
  styling.margin = styling.at("margin", default: (
    top: 25mm,
    right: 20mm,
    bottom: 25mm,
    left: 20mm,
  ))

  language = if data != none {
    data.at("language", default: language)
  } else { language }

  // Translations
  let t = if type(language) == str { languages.at(language) }
          else if type(language) == dictionary { language }
          else { panic("Language must be either a string or a dictionary.") }

  // override parts of translation, e.g. change word "Invoice" into "Quote"
  if override-translation != none {
    for k in t.keys() {
      if override-translation.at(k, default: none) != none {
        t.insert(k, override-translation.at(k))
      }
    }
  }

  if data != none {
    language = data.at("language", default: language)
    currency = data.at("currency", default: currency)
    country = data.at("country", default: t.country)
    title = data.at("title", default: title)
    logo = data.at("logo", default: logo)
    invoice-id = data.at("invoice-id", default: invoice-id)
    cancellation = data.at("cancellation", default: cancellation)
    issuing-date = data.at("issuing-date", default: issuing-date)
    delivery-date = data.at("delivery-date", default: delivery-date)
    biller = data.at("biller", default: biller)
    recipient = data.at("recipient", default: recipient)
    keywords = data.at("keywords", default: keywords)
    hourly-rate = data.at("hourly-rate", default: hourly-rate)
    styling = data.at("styling", default: styling)
    items = data.at("items", default: items)
    discount = data.at("discount", default: discount)
    vat = data.at("vat", default: vat)
  }

  let signature = ""
  let issuing-date = if issuing-date != none { issuing-date }
        else { datetime.today().display("[year]-[month]-[day]") }

  set document(
    title: title,
    keywords: keywords,
    date: parse-date(issuing-date),
  )
  set page(
    margin: styling.margin,
    numbering: none,
    footer: context [
    #set align(right)
    #set text(8pt)
    #grid(
        columns: (1fr, 1fr, 1fr),
        align: (left, center, right),
        [#text(size: 1em, fill: text-secondary)[#footer-text]], [], [#counter(page).display(
      "1/1",
        both: true,
      )],
    )
  ]
  )
  set par(justify: true)
  set text(
    lang: t.id,
    font: if styling.font != none { styling.font } else { () },
    size: styling.font-size,
    fill: text-primary,
  )
  set table(stroke: none)

  // En-tête avec logo à gauche et informations de l'émetteur à droite
  grid(
    columns: (1fr, 1fr),
    gutter: 2em,
    align(left)[#logo],
    align(right)[
        #text(size: 1.5em, fill: primary-color)[
            *#biller.company* \
        ]
      #biller.address \
      #{if biller.vat-id.starts-with("DE"){"USt-IdNr.:"}}
      #t.vat: #biller.vat-id
    ]
  )

  v(1em)

  align(left)[#block()[
    #text(weight: "bold", size: 2em, fill: primary-color)[
      #(if title != none { title } else {
        if cancellation { t.cancellation-invoice }
        else { t.invoice }
      })
    ] \
    #text(size: 1em, fill: text-secondary)[#t.invoice-id:]
    #text(size: 1em, fill: text-secondary)[#invoice-id] \
    #text(size: 1em, fill: text-secondary)[#t.issuing-date:]
    #text(size: 1em, fill: text-secondary)[#custom-date-format(parse-date(issuing-date), "DD/MM/YYYY", language)]
  ]]

  line(length: 100%, stroke: 1pt + primary-color)

  v(1em)

  box(fill: grayish, stroke: more-grayish, radius: 0.5em, inset: 1em, width: 100%)[
    #text(fill: primary-color, size: 1.2em)[*#t.recipient.title*]
    #table(
        columns: 2,
        align: (left, left),
        inset: 5pt,
        column-gutter: 2em,
        if recipient.name != none {
          ([#text(fill: text-secondary)[*#t.recipient.name:*]])
        },
        if recipient.name != none {
          [#recipient.name]
        },
        if recipient.phone != none {
          ([#text(fill: text-secondary)[*#t.recipient.phone:*]])
        },
        if recipient.phone != none {
          [#recipient.phone]
        },
        if recipient.email != none {
          ([#text(fill: text-secondary)[*#t.recipient.email:*]])
        },
        if recipient.email != none {
          [#recipient.email]
        },
        if recipient.address != none {
          ([#text(fill: text-secondary)[*#t.recipient.address:*]])
        },
        if recipient.address != none {
          [#recipient.address]
        },
        if recipient.vat-id != none {
          ([#text(fill: text-secondary)[*#t.recipient.vat:*]])
        },
        if recipient.vat-id != none {
          [#recipient.vat-id]
        },
    )
  ]

  if cancellation {
    (t.cancellation-notice)(invoice-id, custom-date-format(parse-date(issuing-date), "DD/MM/YYYY", language))
  }

  v(1em)

  text(fill: primary-color, size: 1.2em)[== #t.items]

  v(1em)

  let getRowTotal = row => {
    if row.at("dur-min", default: 0) == 0 {
      row.price * row.at("quantity", default: 1)
    }
    else {
      calc.round(hourly-rate * (row.dur-min / 60), digits: 2)
    }
  }

  let cancel-neg = if cancellation { -1 } else { 1 }

  table(
    columns: (auto, 1fr, auto, auto, auto, auto),
    align: (col, row) =>
        if row == 0 {
          (right,left,center,center,center,center,).at(col)
        }
        else {
          (right,left,right,right,right,right,).at(col)
        },
    inset: 6pt,
    table.header(
      // TODO: Add after https://github.com/typst/typst/issues/3734
      // align: (right,left,left,center,center,center,center,),
      table.hline(stroke: 0.5pt),
      [*#t.number*],
      [*#t.description*],
      [*#t.duration*\ #text(size: 0.8em, fill: text-secondary)[( min )]],
      [*#t.quantity*],
      [*#t.price*\ #text(size: 0.8em, fill: text-secondary)[( #currency )]],
      [*#t.total*\ #text(size: 0.8em, fill: text-secondary)[( #currency )]],
      table.hline(stroke: 0.5pt),
    ),
    ..items
      .enumerate()
      .map(((index, row)) => {
        let dur-min = row.at("dur-min", default: 0)
        let dur-hour = dur-min / 60

        (
          row.at("number", default: index + 1),
          row.description,
          str(if dur-min == 0 { "" } else { dur-min }),
          str(row.at("quantity", default: if dur-min == 0 { "1" } else { "" })),
          str(add-zeros(cancel-neg *
           row.at("price", default: calc.round(hourly-rate * dur-hour, digits: 2))
          )),
          str(add-zeros(cancel-neg * getRowTotal(row))),
        )
      })
      .flatten()
      .map(str),
    table.hline(stroke: 0.5pt),
  )

  let sub-total = items
        .map(getRowTotal)
        .sum()

  let total-duration = items
        .map(row => int(row.at("dur-min", default: 0)))
        .sum()

  let discount-value = if discount == none { 0 }
    else {
      if (discount.type == "fixed") { discount.value }
      else if discount.type == "proportionate" {
        sub-total * discount.value
      }
      else { panic(["#discount.type" is no valid discount type]) }
    }
  let discount-label = if discount == none { 0 }
    else {
      if (discount.type == "fixed") { str(discount.value) + " " + currency }
      else if discount.type == "proportionate" {
        str(discount.value * 100) + " %"
      }
      else { panic(["#discount.type" is no valid discount type]) }
    }
  let has-reverse-charge = {
    if biller.vat-id != none and recipient.vat-id != none {
      biller.vat-id.slice(0, 2) != recipient.vat-id.slice(0, 2)
    }
    else { false }
  }
  let tax = if has-reverse-charge { 0 } else { sub-total * vat }
  let total = sub-total - discount-value + tax

  let table-entries = (
    if total-duration != 0 {
      ([#t.total-time:], [*#total-duration min*])
    },
    if (discount-value != 0) or (vat != 0) {
      ([#t.subtotal:],
      [#{add-zeros(cancel-neg * sub-total)} #currency])
    },
    if discount-value != 0 {
      (
        [#t.discount-of #discount-label
          #{if discount.reason != "" { "(" + discount.reason + ")" }}],
        [-#add-zeros(cancel-neg * discount-value) #currency]
      )
    },
    if not has-reverse-charge and (vat != 0) {
      ([#t.vat #{vat * 100} %:],
        [#{add-zeros(cancel-neg * tax)} #currency]
      )
    },
    if (vat == 0) {([#t.no-vat], [ ])},
    if (has-reverse-charge) {
      ([#t.vat:], text(0.9em)[#t.reverse-charge])
    },
    (
      text(fill: primary-color, size: 1.2em)[*#t.total*:],
      text(fill: primary-color, size: 1.2em)[*#add-zeros(cancel-neg * total) #currency*]
    ),
  )
  .filter(entry => entry != none)

  align(right,
    table(
      columns: 2,
      fill: (col, row) => // if last row
        if row == table-entries.len() - 1 { grayish }
        else { none },
      ..table-entries
        .flatten(),
    )
  )

  v(1em)

  if not cancellation {
    v(1em)
    align(left)[
      #block(
        breakable: false,
        table(
          fill: grayish,
          // stroke: 1pt + blue,
          // columns: 2, // TODO: Doesn't work for unknown reason
          columns: (auto, 1fr),
          inset: 4pt,
          align: (col, row) => (left,left).at(col),
          [#t.owner:], [*#biller.company*],
          [#t.iban:], [*#biller.iban*],
          [#t.bic:], [*#biller.bic*],
        )
      )
    ]
    v(1em)

    text(size: 0.8em, fill: text-secondary)[#t.qr-code-text]

qr-code("BCD\n" + "001\n" + "1\n" + "SCT\n" + biller.bic + "\n" + biller.company + "\n" + biller.iban + "\n" + "EUR" + str(total), width: 8em)


  }
  else {
    v(1em)
  }

  doc
}


#show: invoice.with(
  language: "fr",
  logo: image("logo.png", width: 12em),
  invoice-id: "636123271736712",
  primary-color: rgb("#EC6719"),
  vat: 0.21,
  // // Uncomment this to create a cancellation invoice
  cancellation: false,
  issuing-date: "2024-03-10",
  footer-text: "Merci pour votre commande !",
  biller: (
    company: "Olivautos",
    vat-id: "377812873278",
    bic: "NTSBFRM1XXX",
    iban: "FR802043302626N261770009576",
    address: "23 Rue de la Royale Harmonie\n1420 Braine l'alleud\nBelgique",
  ),
  hourly-rate: 100, // For any items with `dur-min` but no `price`
  recipient: (
    name: "Roman LOPES",
    phone: "06 12 34 56 78",
    email: "roman@lopes.com",
    address: "11 Rue du chateau\n75000 Paris\nFrance",
    vat-id: none,
  ),
  items: (
    (
      // number: 3, // You can also specify a custom item number
      date: "2016-04-03",
      description: "Arc reactor",
      // dur-min: 0, Either specify `dur-min` or `quantity` & `price`
      quantity: 1,
      price: 15,
    ),
    (
      date: "2016-04-05",
      description: "Flux capacitor",
      dur-min: 0,
      quantity: 1,
      price: 10,
    ),
    (
      date: "2016-04-07",
      description: "Lightsaber",
      dur-min: 0,
      quantity: 2,
      price: 5,
    ),
    (
      date: "2016-04-08",
      description: "Sonic screwdriver",
      dur-min: 0,
      quantity: 10,
      price: 2,
    ),
    (
      date: "2016-04-08",
      description: "Sonic screwdriver",
      dur-min: 0,
      quantity: 10,
      price: 1,
    ),
    (
      date: "2016-04-08",
      description: "Sonic screwdriver",
      dur-min: 0,
      quantity: 10,
      price: 1,
    ),
  ),
)