// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use sysinfo::System;

#[cfg(target_os = "windows")]
use windows::Win32::UI::Input::KeyboardAndMouse::GetCursorPos;
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::POINT;

#[cfg(target_os = "linux")]
use x11rb::connection::Connection;
#[cfg(target_os = "linux")]
use x11rb::protocol::xproto::QueryPointerRequest;

#[cfg(target_os = "macos")]
use cocoa::appkit::NSEvent;
#[cfg(target_os = "macos")]
use cocoa::base::nil;
#[cfg(target_os = "macos")]
use cocoa::foundation::NSPoint;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    name: String,
    pid: u32,
    memory_usage: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CursorPosition {
    x: i32,
    y: i32,
}

#[tauri::command]
fn get_running_processes() -> Vec<ProcessInfo> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let mut processes: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .filter_map(|(pid, process)| {
            // Filter out system processes and get only user applications
            if process.name().len() > 0 && !process.name().contains("system") {
                Some(ProcessInfo {
                    name: process.name().to_string(),
                    pid: pid.as_u32(),
                    memory_usage: process.memory(),
                })
            } else {
                None
            }
        })
        .collect();
    
    // Sort by memory usage and take top 3
    processes.sort_by(|a, b| b.memory_usage.cmp(&a.memory_usage));
    processes.truncate(3);
    
    processes
}

#[tauri::command]
fn get_cursor_position() -> CursorPosition {
    #[cfg(target_os = "windows")]
    {
        unsafe {
            let mut point = POINT { x: 0, y: 0 };
            if GetCursorPos(&mut point).as_bool() {
                return CursorPosition {
                    x: point.x,
                    y: point.y,
                };
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        unsafe {
            let mouse_location: NSPoint = NSEvent::mouseLocation(nil);
            return CursorPosition {
                x: mouse_location.x as i32,
                y: mouse_location.y as i32,
            };
        }
    }

    #[cfg(target_os = "linux")]
    {
        // For Linux, we'll use a simpler approach with x11rb
        // This is a basic implementation and might need additional setup
        if let Ok((conn, _)) = x11rb::connect(None) {
            if let Ok(cookie) = conn.send_request(&QueryPointerRequest {
                window: conn.setup().roots[0].root,
            }) {
                if let Ok(reply) = conn.wait_for_reply(cookie) {
                    return CursorPosition {
                        x: reply.root_x as i32,
                        y: reply.root_y as i32,
                    };
                }
            }
        }
    }

    // Fallback for unsupported platforms or errors
    CursorPosition { x: 0, y: 0 }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_running_processes,
            get_cursor_position
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
