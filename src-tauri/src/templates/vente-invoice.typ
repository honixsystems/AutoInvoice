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
      vehicle: (
        title: "Vehicle",
        brand-model: "Brand/Model",
        vin: "VIN",
        mileage: "Mileage",
        color: "Color",
        type: "Type",
        first-registration: "First reg.",
        delivered-with: "This vehicle was delivered with",
      ),
      biller: "Biller",
      invoice: "Vehicle invoice",
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
      total: "Total to pay",
      deposit: "Deposit",
      owner: "Owner",
      iban: "IBAN",
      bic: "BIC",
      qr-code-text: "You can scan the QR code below with your bank app to make the payment.",
      notes: "Additional notes",
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
      vehicle: (
        title: "Véhicule",
        brand-model: "Marque/Modèle",
        vin: "N° de chassis",
        mileage: "Kilométrage",
        color: "Couleur",
        type: "Type",
        first-registration: "1ère immat.",
        delivered-with: "Ce véhicule est livré avec",
      ),
      biller: "Émetteur",
      invoice: "Facture de vente",
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
      total: "Reste à payer",
      deposit: "Accompte",
      owner: "Titulaire",
      iban: "IBAN",
      bic: "BIC",
      qr-code-text: "Vous pouvez scanner le QR code ci-dessous avec votre application de banque pour effectuer le paiement.",
      notes: "Notes additionnelles",
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
      vehicle: (
        title: "Fahrzeug",
        brand-model: "Marke/Modell",
        vin: "Chassisnummer",
        mileage: "Kilometerstand",
        color: "Farbe",
        type: "Typ",
        first-registration: "Erstzulassung",
        delivered-with: "Dieses Fahrzeug wurde mit",
      ),
      biller: "Aussteller",
      invoice: "Fahrzeugrechnung",
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
      total: "Rest zu zahlen",
      deposit: "Anzahlung",
      owner: "Inhaber",
      iban: "IBAN",
      bic: "BIC",
      qr-code-text: "Sie können den QR-Code unten scannen, um den Betrag zu zahlen.",
      notes: "Zusätzliche Notizen",
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
  vehicle: (:),
  recipient: (:),
  keywords: (),
  hourly-rate: none,
  styling: (:), // font, font-size, margin (sets defaults below)
  items: (),
  display-vat: true,
  vat: 0.2,
  data: none,
  override-translation: none,
  primary-color: rgb(255, 100, 100),
  footer-text: none,
  total: none,
  deposit: none,
  notes: (),
  doc,
) = {
  // Set styling defaults
  styling.font = styling.at("font", default: "Arial")
  styling.font-size = styling.at("font-size", default: 9pt)
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
    vehicle = data.at("vehicle", default: vehicle)
    recipient = data.at("recipient", default: recipient)
    keywords = data.at("keywords", default: keywords)
    hourly-rate = data.at("hourly-rate", default: hourly-rate)
    styling = data.at("styling", default: styling)
    items = data.at("items", default: items)
    discount = data.at("discount", default: discount)
    vat = data.at("vat", default: vat)
    notes = data.at("notes", default: notes)
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

  grid(
    columns: (1fr, 1fr),
    gutter: 2em,
    align: (left, right),
    align(left)[
      #text(weight: "bold", size: 2em, fill: primary-color)[
        #(if title != none { title } else {
          if cancellation { t.cancellation-invoice }
          else { t.invoice }
        })
      ]
    ],
    align(right)[
      #text(size: 1em, fill: text-secondary)[#t.invoice-id:]
      #text(size: 1em, fill: text-secondary)[#invoice-id] \
      #text(size: 1em, fill: text-secondary)[#t.issuing-date:]
      #text(size: 1em, fill: text-secondary)[#custom-date-format(parse-date(issuing-date), "DD/MM/YYYY", language)]
    ]
  )

  line(length: 100%, stroke: 1pt + primary-color)

  v(1em)

  table(
    columns: 2,
    align: (left, left),
    inset: 5pt,
    box(fill: grayish, stroke: more-grayish, radius: 0.5em, inset: 1em, width: 100%)[
      #h(0.4em)
      #text(fill: primary-color, size: 1.2em, baseline: 0.5em)[*#t.recipient.title*]
      #table(
          columns: 2,
          align: (left, left),
          inset: 5pt,
          column-gutter: 1em,
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
    ],

    box(fill: grayish, stroke: more-grayish, radius: 0.5em, inset: 1em, width: 100%)[
      #h(0.4em)
      #text(fill: primary-color, size: 1.2em, baseline: 0.5em)[*#t.vehicle.title*]
      #table(
          columns: 2,
          align: (left, left),
          inset: 5pt,
          column-gutter: 1em,
          if vehicle.brand-model != none {
            ([#text(fill: text-secondary)[*#t.vehicle.brand-model:*]])
          },
          if vehicle.brand-model != none {
            [#vehicle.brand-model]
          },
          if vehicle.vin != none {
            ([#text(fill: text-secondary)[*#t.vehicle.vin:*]])
          },
          if vehicle.vin != none {
            [#vehicle.vin]
          },
          if vehicle.mileage != none {
            ([#text(fill: text-secondary)[*#t.vehicle.mileage:*]])
          },
          if vehicle.mileage != none {
            [#vehicle.mileage] + " km"
          },
          if vehicle.color != none {
            ([#text(fill: text-secondary)[*#t.vehicle.color:*]])
          },
          if vehicle.color != none {
            [#vehicle.color]
          },
          if vehicle.type != none {
            ([#text(fill: text-secondary)[*#t.vehicle.type:*]])
          },
          if vehicle.type != none {
            [#vehicle.type]
          },
          if vehicle.first-registration != none {
            ([#text(fill: text-secondary)[*#t.vehicle.first-registration:*]])
          },
          if vehicle.first-registration != none {
            [#custom-date-format(parse-date(vehicle.first-registration), "DD/MM/YYYY", language)]
          },
      )
    ]
  )

  if vehicle.delivered-with != none {
    v(1em)
    text(size: 0.8em, fill: text-secondary)[*#t.vehicle.delivered-with*:]
    for i in vehicle.delivered-with {
      [- #i]
    }
  }

  if notes != none {
    v(1em)
    text(size: 0.8em, fill: text-secondary)[*#t.notes*:]
    for note in notes {
      [- #note]
    }
  }

  if total != none {
    v(2em)
    align(right)[
      #line(length: 100%, stroke: 1pt + more-grayish)
      #text()[*#t.subtotal*:] #text()[*#calc.round(total, digits: 2)*] #text()[ *#currency*] \
      #if deposit != none {
        text()[*#t.deposit*: ]; text()[*#deposit*]; text()[ *#currency*]; str("\n")
      }
      #v(0.1em)
      #if deposit != none {
        text(size: 1.5em, fill: primary-color)[*#t.total*: ]; text(size: 1.5em, fill: primary-color)[*#calc.round(total - deposit, digits: 2)*]; text(size: 1.5em, fill: primary-color)[ *#currency*]
      } else {
        text(size: 1.5em, fill: primary-color)[*#t.total*: ]; text(size: 1.5em, fill: primary-color)[*#total*]; text(size: 1.5em, fill: primary-color)[ *#currency*]
      }
    ]
  }

  if cancellation {
    (t.cancellation-notice)(invoice-id, custom-date-format(parse-date(issuing-date), "DD/MM/YYYY", language))
  }

  v(1em)

  

  v(1em)

  if not cancellation {
    v(1em)
    block(
      breakable: false,
      align(left)[
        #table(
          fill: grayish,
          columns: (auto, 1fr),
          inset: 4pt,
          align: (col, row) => (left,left).at(col),
          [#t.owner:], [*#biller.company*],
          [#t.iban:], [*#biller.iban*],
          [#t.bic:], [*#biller.bic*],
        )
        #text(size: 0.8em, fill: text-secondary)[#t.qr-code-text]
        #qr-code("BCD\n" + "001\n" + "1\n" + "SCT\n" + biller.bic + "\n" + biller.company + "\n" + biller.iban + "\n" + "EUR" + "1", width: 8em)
      ],
    )
  }
  else {
    v(1em)
  }
  doc
}


#show: invoice.with(
  language: "fr",
  logo: image("logo.png", width: 12em),
  invoice-id: "13032024",
  primary-color: rgb("#EC6719"),
  display-vat: false,
  vat: 0.21,
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
  vehicle: (
    brand-model: "Peugeot 208",
    vin: "12345678901234567",
    mileage: "100000",
    color: "Rouge",
    type: "Berline",
    first-registration: "2016-01-01",
    delivered-with: (
      "Carpass",
      "Contrôle technique",
      "Livraison",
      "Carnet d'entretien",
      "Certificat de conformité",
      "4 Clefs"
    )
  ),
  recipient: (
    name: "Roman LOPES",
    phone: "06 12 34 56 78",
    email: "roman@lopes.com",
    address: "35 sentier des passereaux, Domaine du cap sicié, 75000 Paris,France",
    vat-id: none,
  ),
  total: 1000,
  deposit: 500,
  notes: (
    "Ce véhicule est vendu sous le régime de la marge",
  ),
)