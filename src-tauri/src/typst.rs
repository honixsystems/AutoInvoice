use serde_json::Value;
use std::fs;
use std::fs::read;
use tauri::Manager;
use typst::ecow::EcoVec;
use typst::foundations::{Array, Dict, IntoValue, Str};
use typst_as_lib::cached_file_resolver::IntoCachedFileResolver;
use typst_as_lib::file_resolver::FileSystemResolver;
use typst_as_lib::TypstEngine;

#[tauri::command]
pub fn generate_pdf(
    app: tauri::AppHandle,
    template_name: &str,
    data: Value,
) -> Result<Vec<u8>, String> {
    let template_content = load_template(&app, template_name)?;
    let resource_dir = app.path().resource_dir().unwrap();
    let template_id = format!(
        "{}/resources/typst/templates/{}.typ",
        resource_dir.display(),
        template_name
    );
    let font_regular: Vec<u8> = read(
        app.path()
            .resource_dir()
            .unwrap()
            .join("resources/typst/fonts/Geist-Regular.ttf"),
    )
    .unwrap();
    let font_semibold: Vec<u8> = read(
        app.path()
            .resource_dir()
            .unwrap()
            .join("resources/typst/fonts/Geist-SemiBold.ttf"),
    )
    .unwrap();
    // Compiler avec le template et les données
    let dict = convert_json_to_dict(data)?;

    // Créer un nouveau moteur avec le résolveur de template
    let builder = TypstEngine::builder();
    let builder = builder.fonts([font_regular, font_semibold]);
    let builder = builder.add_file_resolver(
        FileSystemResolver::new(
            app.path()
                .resource_dir()
                .unwrap()
                .join("resources/typst/templates"),
        )
        .local_package_root(
            app.path()
                .resource_dir()
                .unwrap()
                .join("resources/typst/packages"),
        )
        .into_cached(),
    );
    let builder = builder
        .with_static_source_file_resolver([(template_id.as_str(), template_content.as_str())]);
    let mut builder = builder;
    builder.comemo_evict_max_age(Some(60_000));
    let template_engine = builder.build();

    let result = template_engine.compile_with_input(template_id.as_str(), dict);

    // Gérer les erreurs de compilation
    let doc = match result.output {
        Ok(doc) => {
            println!("Compilation Typst réussie");
            doc
        }
        Err(errors) => {
            let error_msg = format!("{:?}", errors);
            println!("Erreur de compilation Typst: {}", error_msg);
            return Err(format!("Erreur de compilation Typst:\n{}", error_msg));
        }
    };

    // Create pdf
    println!("Début de la création du PDF");
    let options = Default::default();
    let pdf = typst_pdf::pdf(&doc, &options).map_err(|e| {
        println!("Erreur lors de la création du PDF: {:?}", e);
        format!("{:?}", e)
    })?;
    println!("PDF créé avec succès, taille: {} octets", pdf.len());

    // Retourner directement le Vec<u8> sans conversion supplémentaire
    Ok(pdf)
}

fn convert_json_to_dict(value: Value) -> Result<Dict, String> {
    match value {
        Value::Object(map) => {
            let mut dict = Dict::new();
            for (key, value) in map {
                dict.insert(Str::from(key), convert_json_to_value(value)?);
            }
            Ok(dict)
        }
        _ => Err("Les données doivent être un objet JSON".to_string()),
    }
}

fn convert_json_to_value(value: Value) -> Result<typst::foundations::Value, String> {
    match value {
        Value::Null => Ok(typst::foundations::Value::None),
        Value::Bool(b) => Ok(b.into_value()),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                Ok(i.into_value())
            } else if let Some(f) = n.as_f64() {
                Ok(f.into_value())
            } else {
                Err("Nombre non supporté".to_string())
            }
        }
        Value::String(s) => Ok(s.into_value()),
        Value::Array(arr) => {
            // Vérifier si c'est un tableau d'octets (Uint8Array)
            if arr
                .iter()
                .all(|v| v.is_number() && v.as_i64().map_or(false, |n| n >= 0 && n <= 255))
            {
                // Convertir en bytes
                let bytes: Vec<u8> = arr
                    .iter()
                    .filter_map(|v| v.as_i64().map(|n| n as u8))
                    .collect();
                Ok(typst::foundations::Value::Bytes(
                    typst::foundations::Bytes::new(bytes),
                ))
            } else {
                // Traitement normal pour les autres types de tableaux
                let values: Result<Vec<_>, _> =
                    arr.into_iter().map(convert_json_to_value).collect();
                match values {
                    Ok(v) => Ok(typst::foundations::Value::Array(Array::from(EcoVec::from(
                        v,
                    )))),
                    Err(e) => Err(e),
                }
            }
        }
        Value::Object(map) => {
            let dict = convert_json_to_dict(Value::Object(map))?;
            Ok(dict.into_value())
        }
    }
}

fn load_template(app: &tauri::AppHandle, template_name: &str) -> Result<String, String> {
    println!("Chargement du template: {}", template_name);
    let template_path = format!("resources/typst/templates/{}.typ", template_name);
    let tauri_path = app.path().resource_dir().unwrap().join(template_path);
    println!("Chemin du template: {}", tauri_path.display());

    match fs::read_to_string(&tauri_path) {
        Ok(content) => {
            println!(
                "Template chargé avec succès, taille: {} octets",
                content.len()
            );
            Ok(content)
        }
        Err(e) => {
            println!("Erreur lors du chargement du template: {}", e);
            Err(format!(
                "Erreur lors du chargement du template {}: {}",
                template_name, e
            ))
        }
    }
}
