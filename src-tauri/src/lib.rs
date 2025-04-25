#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::menu::{Menu, MenuItem};
mod mac;
mod migrations;
mod typst;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:autoinvoice.db", migrations::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let _menu = Menu::with_items(app, &[&quit_i])?;

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            typst::generate_pdf,
            mac::get_mac_address
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
