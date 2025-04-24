#import "@local/codetastic:0.2.2": qrcode
#import "@local/datify:0.1.3": custom-date-format
#import sys: inputs

// Tronquer un nombre à 2 décimales
// et ajouter des zéros si nécessaire
// Ex: 1.234 -> 1.23, 1.2 -> 1.20
#let add-zeros = (num) => {
    let frags = str(num).split(".")
    let (intp, decp) = if frags.len() == 2 { frags } else { (num, "00") }
    str(intp) + "." + (str(decp) + "00").slice(0, 2)
  }

#let parse-date = (date-str) => {
  let parts = date-str.split("-")
  if parts.len() != 3 {
    panic(
      "Format de date invalide: " + date-str + "\n" +
      "Format attendu: YYYY-MM-DD"
    )
  }
  datetime(
    year: int(parts.at(0)),
    month: int(parts.at(1)),
    day: int(parts.at(2)),
  )
}

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
        brandModel: "Brand/Model",
        vin: "VIN",
        mileage: "Mileage",
        color: "Color",
        type: "Type",
        firstRegistration: "First reg.",
        deliveredWith: "This vehicle was delivered with",
      ),
      biller: "Biller",
      invoice: "Vehicle invoice",
      cancellationInvoice: "Cancellation Invoice",
      cancellationNotice: (id, issuingDate) => [
        As agreed, you will receive a credit note
        for the invoice *#id* dated *#issuingDate*.
      ],
      invoiceId: "Invoice ID",
      issuingDate: "Issuing Date",
      deliveryDate: "Delivery Date",
      items: "Items",
      number: "№",
      date: "Date",
      description: "Description",
      duration: "Duration",
      quantity: "Quantity",
      price: "Price",
      totalTime: "Total working time",
      subtotal: "Subtotal",
      discountOf: "Discount of",
      vat: "VAT of",
      noVat: "Not Subject to VAT",
      reverseCharge: "Reverse Charge",
      total: "Total to pay",
      cancellationTotal: "Total to refund",
      deposit: "Deposit",
      owner: "Owner",
      iban: "IBAN",
      bic: "BIC",
      qrCodeText: "You can scan the QR code below with your bank app to make the payment.",
      notes: "Additional notes",
      cgv: "General Terms and Conditions",
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
        brandModel: "Marque/Modèle",
        vin: "N° de chassis",
        mileage: "Kilométrage",
        color: "Couleur",
        type: "Type",
        firstRegistration: "1ère immat.",
        deliveredWith: "Ce véhicule est livré avec",
      ),
      biller: "Émetteur",
      invoice: "Facture de vente",
      cancellationInvoice: "Note de crédit",
      cancellationNotice: (id, issuingDate) => [
        Comme convenu, vous recevrez un crédit
        pour la facture *#id* du *#issuingDate*.
      ],
      invoiceId: "Facture N°",
      issuingDate: "Date d'émission",
      deliveryDate: "Date de livraison",
      items: "Détail",
      number: "N°",
      date: "Date",
      description: "Description",
      duration: "Durée",
      quantity: "Quantité",
      price: "Prix",
      totalTime: "Temps total travaillé",
      subtotal: "Sous-total",
      discountOf: "Remise de",
      vat: "TVA",
      noVat: "Non sujet à la TVA",
      reverseCharge: "Facturation inversée",
      total: "Reste à payer",
      cancellationTotal: "Total à rembourser",
      deposit: "Accompte",
      owner: "Titulaire",
      iban: "IBAN",
      bic: "BIC",
      qrCodeText: "Vous pouvez scanner le QR code ci-dessous avec votre application de banque pour effectuer le paiement.",
      notes: "Notes additionnelles",
      cgv: "Conditions générales de vente",
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
        brandModel: "Marke/Modell",
        vin: "Chassisnummer",
        mileage: "Kilometerstand",
        color: "Farbe",
        type: "Typ",
        firstRegistration: "Erstzulassung",
        deliveredWith: "Dieses Fahrzeug wurde mit",
      ),
      biller: "Aussteller",
      invoice: "Fahrzeugrechnung",
      cancellationInvoice: "Stornorechnung",
      cancellationNotice: (id, issuingDate) => [
        Vereinbarungsgemäß erhalten Sie hiermit eine Gutschrift
        zur Rechnung *#id* vom *#issuingDate*.
      ],
      invoiceId: "Rechnungsnummer",
      issuingDate: "Ausstellungsdatum",
      deliveryDate: "Lieferdatum",
      items: "Leistungen",
      number: "Nr",
      date: "Datum",
      description: "Beschreibung",
      duration: "Dauer",
      quantity: "Menge",
      price: "Preis",
      totalTime: "Gesamtarbeitszeit",
      subtotal: "Zwischensumme",
      discountOf: "Rabatt von",
      vat: "Umsatzsteuer von",
      noVat: "Nicht Umsatzsteuerpflichtig",
      reverseCharge: "Steuerschuldnerschaft des\nLeistungsempfängers",
      total: "Rest zu zahlen",
      cancellationTotal: "Total zu erstatten",
      deposit: "Anzahlung",
      owner: "Inhaber",
      iban: "IBAN",
      bic: "BIC",
      qrCodeText: "Sie können den QR-Code unten scannen, um den Betrag zu zahlen.",
      notes: "Zusätzliche Notizen",
      cgv: "Allgemeine Geschäftsbedingungen",
    ),
  )

#let invoice(
  config: (:),
  biller: (:),
  recipient: (:),
  vehicle: (:),
  styling: (:), // font, fontSize, margin (sets defaults below)
  data: none,
  overrideTranslation: none,
  total: none,
  deposit: none,
  notes: (),
  doc,
) = {
  // Set styling defaults
  styling.font = styling.at("font", default: "Arial")
  styling.fontSize = styling.at("fontSize", default: 9pt)
  styling.margin = styling.at("margin", default: (
    top: 25mm,
    right: 20mm,
    bottom: 25mm,
    left: 20mm,
  ))

  config.language = if data != none {
    data.at("language", default: config.language)
  } else { config.language }

  // Translations
  let t = if type(config.language) == str { languages.at(config.language) }
          else if type(config.language) == dictionary { config.language }
          else { panic("Language must be either a string or a dictionary.") }

  // override parts of translation, e.g. change word "Invoice" into "Quote"
  if overrideTranslation != none {
    for k in t.keys() {
      if overrideTranslation.at(k, default: none) != none {
        t.insert(k, overrideTranslation.at(k))
      }
    }
  }

  let grayish = rgb("#fafafa")
  let moreGrayish = rgb("#f0f0f0")
  let textPrimary = rgb("#0f0f0f")
  let textSecondary = rgb("#3c3c3c")
  let primaryColor = rgb(config.primaryColor)

  if data != none {
    config.language = data.at("language", default: config.language)
    config.currency = data.at("currency", default: config.currency)
    config.country = data.at("country", default: t.country)
    config.title = data.at("title", default: config.title)
    config.invoiceId = data.at("invoiceId", default: config.invoiceId)
    config.cancellation = data.at("cancellation", default: config.cancellation)
    config.date = data.at("date", default: config.date)
    biller = data.at("biller", default: biller)
    vehicle = data.at("vehicle", default: vehicle)
    recipient = data.at("recipient", default: recipient)
    keywords = data.at("keywords", default: keywords)
    hourlyRate = data.at("hourlyRate", default: hourlyRate)
    styling = data.at("styling", default: styling)
    items = data.at("items", default: items)
    discount = data.at("discount", default: discount)
    vatRate = data.at("vatRate", default: vatRate)
    notes = data.at("notes", default: notes)
  }

  let signature = ""
  let date = if config.date != none { config.date }
        else { datetime.today().display("[year]-[month]-[day]") }

  set document(
    title: t.invoice,
    date: parse-date(date),
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
        if config.footerText != none and config.footerText != "" {
          [#text(size: 1em, fill: textSecondary)[#config.footerText]]
        },
        [],
        [#counter(page).display(
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
    size: styling.fontSize,
    fill: textPrimary,
  )
  set table(stroke: none)

  // En-tête avec logo à gauche et informations de l'émetteur à droite
  grid(
    columns: (1fr, 1fr),
    gutter: 2em,
    align(left)[#image.decode(biller.logo, width: 12em)],
    align(right)[
        #text(size: 1.5em, fill: primaryColor)[
            *#biller.name* \
        ]
      #biller.address \
      #biller.phone \
      #{if biller.vat.starts-with("DE"){"USt-IdNr.:"}}
      #t.vat: #biller.vat
    ]
  )

  grid(
    columns: (1fr, 1fr),
    gutter: 2em,
    align: (left, right),
    align(left)[
      #text(weight: "bold", size: 2em, fill: primaryColor)[
        #(if config.cancellation { t.cancellationInvoice } else { t.invoice })
      ]
    ],
    align(right)[
      #text(size: 1em, fill: textSecondary)[#t.invoiceId: ]
      #text(size: 1em, fill: textSecondary)[#config.invoiceId] \
      #text(size: 1em, fill: textSecondary)[#t.issuingDate: ]
      #text(size: 1em, fill: textSecondary)[#custom-date-format(parse-date(date), "DD/MM/YYYY", config.language)]
    ]
  )

  line(length: 100%, stroke: 1pt + primaryColor)

  v(1em)

  table(
    columns: 2,
    align: (left, left),
    inset: 5pt,
    box(fill: grayish, stroke: moreGrayish, radius: 0.5em, inset: 1em, width: 100%)[
      #h(0.4em)
      #text(fill: primaryColor, size: 1.2em, baseline: 0.5em)[*#t.recipient.title*]
      #table(
          columns: 2,
          align: (left, left),
          inset: 5pt,
          column-gutter: 1em,
          if recipient.name != none and recipient.name != "" {
            ([#text(fill: textSecondary)[*#t.recipient.name:*]])
          },
          if recipient.name != none and recipient.name != "" {
            [#recipient.name]
          },
          if recipient.phone != none and recipient.phone != "" {
            ([#text(fill: textSecondary)[*#t.recipient.phone:*]])
          },
          if recipient.phone != none and recipient.phone != "" {
            [#recipient.phone]
          },
          if recipient.email != none and recipient.email != "" {
            ([#text(fill: textSecondary)[*#t.recipient.email:*]])
          },
          if recipient.email != none and recipient.email != "" {
            [#recipient.email]
          },
          if recipient.address != none and recipient.address != "" {
            ([#text(fill: textSecondary)[*#t.recipient.address:*]])
          },
          if recipient.address != none and recipient.address != "" {
            [#recipient.address]
          },
          if recipient.vat != none and recipient.vat != "" {
            ([#text(fill: textSecondary)[*#t.recipient.vat:*]])
          },
          if recipient.vat != none and recipient.vat != "" {
            [#recipient.vat]
          },
      )
    ],

    box(fill: grayish, stroke: moreGrayish, radius: 0.5em, inset: 1em, width: 100%)[
      #h(0.4em)
      #text(fill: primaryColor, size: 1.2em, baseline: 0.5em)[*#t.vehicle.title*]
      #table(
          columns: 2,
          align: (left, left),
          inset: 5pt,
          column-gutter: 1em,
          if vehicle.brandModel != none and vehicle.brandModel != "" {
            ([#text(fill: textSecondary)[*#t.vehicle.brandModel:*]])
          },
          if vehicle.brandModel != none and vehicle.brandModel != "" {
            [#vehicle.brandModel]
          },
          if vehicle.vin != none and vehicle.vin != "" {
            ([#text(fill: textSecondary)[*#t.vehicle.vin:*]])
          },
          if vehicle.vin != none and vehicle.vin != "" {
            [#vehicle.vin]
          },
          if vehicle.mileage != none and vehicle.mileage != "" {
            ([#text(fill: textSecondary)[*#t.vehicle.mileage:*]])
          },
          if vehicle.mileage != none and vehicle.mileage != "" {
            [#vehicle.mileage] + " km"
          },
          if vehicle.color != none and vehicle.color != "" {
            ([#text(fill: textSecondary)[*#t.vehicle.color:*]])
          },
          if vehicle.color != none and vehicle.color != "" {
            [#vehicle.color]
          },
          if vehicle.type != none and vehicle.type != "" {
            ([#text(fill: textSecondary)[*#t.vehicle.type:*]])
          },
          if vehicle.type != none and vehicle.type != "" {
            [#vehicle.type]
          },
          if vehicle.firstRegistration != none and vehicle.firstRegistration != "" {
            ([#text(fill: textSecondary)[*#t.vehicle.firstRegistration:*]])
          },
          if vehicle.firstRegistration != none and vehicle.firstRegistration != "" {
            [#custom-date-format(parse-date(vehicle.firstRegistration), "DD/MM/YYYY", config.language)]
          },
      )
    ]
  )

  if vehicle.deliveredWith != none and vehicle.deliveredWith.len() > 0 {
    v(1em)
    text(size: 0.8em, fill: textSecondary)[*#t.vehicle.deliveredWith*:]
    for i in vehicle.deliveredWith {
      [- #i]
    }
  }

  if notes != none and notes != "" {
    v(1em)
    text(size: 0.8em, fill: textSecondary)[*#t.notes*:]
    linebreak()
    notes
  }

  if config.cancellation {
    v(2em)
    (t.cancellationNotice)(config.invoiceId, custom-date-format(parse-date(date), "DD/MM/YYYY", config.language))
  }

  if total != none and not config.cancellation {
    v(2em)
    align(right)[
      #line(length: 100%, stroke: 1pt + moreGrayish)
      #text()[*#t.subtotal*:] #text()[*#calc.round(total, digits: 2)*] #text()[ *#config.currency*] \
      #if deposit != none {
        text()[*#t.deposit*: ]; text()[*#deposit*]; text()[ *#config.currency*]; str("\n")
      }
      #v(0.1em)
      #if deposit != none {
        text(size: 1.5em, fill: primaryColor)[*#t.total*: ]; text(size: 1.5em, fill: primaryColor)[*#calc.round(total - deposit, digits: 2)*]; text(size: 1.5em, fill: primaryColor)[ *#config.currency*]
      } else {
        text(size: 1.5em, fill: primaryColor)[*#t.total*: ]; text(size: 1.5em, fill: primaryColor)[*#total*]; text(size: 1.5em, fill: primaryColor)[ *#config.currency*]
      }
    ]
  }

  if config.cancellation {
    v(2em)
    align(right)[
      #line(length: 100%, stroke: 1pt + moreGrayish)
      #v(0.1em)
      #text(size: 1.5em, fill: primaryColor)[*#t.cancellationTotal*: ]; #text(size: 1.5em, fill: primaryColor)[*#total*]; #text(size: 1.5em, fill: primaryColor)[ *#config.currency*]
    ]
  }

  v(1em)

  if not config.cancellation {
    v(1em)
    block(
      breakable: false,
      align(left)[
        #table(
          fill: grayish,
          columns: (auto, 1fr),
          inset: 4pt,
          align: (col, row) => (left,left).at(col),
          [#t.owner:], [*#biller.name*],
          [#t.iban:], [*#biller.iban*],
          [#t.bic:], [*#biller.bic*],
        )
        #text(size: 0.8em, fill: textSecondary)[#t.qrCodeText] \
        #qrcode("BCD\n" + "001\n" + "1\n" + "SCT\n" + biller.bic + "\n" + biller.name + "\n" + biller.iban + "\n" + "EUR" + str(total - deposit) + "\n" + config.invoiceId, width: 8em)
      ],
    )
  }
  else {
    v(1em)
  }

  if config.cgv != none and config.cgv != "" {
    pagebreak()
    v(1em)
    text(size: 1em, fill: textSecondary)[*#t.cgv*]
    v(1em)
    text(size: 0.5em, fill: textSecondary)[*#config.cgv*]
  }
  doc
}

/*
#show: text(
  [#inputs.total]
)
*/



#show: invoice.with(
  config: (inputs.at("config", default: (:))),
  biller: (inputs.at("biller", default: (:))),
  recipient: (inputs.at("recipient", default: (:))),
  vehicle: (inputs.at("vehicle", default: (:))),
  total: inputs.at("total", default: none),
  deposit: inputs.at("deposit", default: none),
  notes: inputs.at("notes", default: ""),
)


/*
#show: invoice.with(
  config: (
    language: "fr",
    currency: "€",
    date: "2024-03-10",
    invoiceId: "13032024",
    primaryColor: "#EC6719",
    displayVat: false,
    vatRate: 0.21,
    cancellation: false,
    footerText: "Merci pour votre commande !",
  ),
  biller: (
    logo: "logo.png",
    name: "Olivautos",
    vat: "377812873278",
    bic: "NTSBFRM1XXX",
    iban: "FR802043302626N261770009576",
    address: "23 Rue de la Royale Harmonie\n1420 Braine l'alleud\nBelgique",
  ),
  recipient: (
    name: "Roman LOPES",
    phone: "06 12 34 56 78",
    email: "roman@lopes.com",
    address: "35 sentier des passereaux, Domaine du cap sicié, 75000 Paris,France",
    vat: none,
  ),
  vehicle: (
    brandModel: "Peugeot 208",
    vin: "12345678901234567",
    mileage: "100000",
    color: "Rouge",
    type: "Berline",
    firstRegistration: "2016-01-01",
    deliveredWith: (
      "Carpass",
      "Contrôle technique",
      "Livraison",
      "Carnet d'entretien",
      "Certificat de conformité",
      "4 Clefs"
    )
  ),
  total: 1000,
  deposit: 500,
  notes: "Notes additionnelles",
)*/
