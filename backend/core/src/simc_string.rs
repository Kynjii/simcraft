//! Low-level helpers for reading and mutating SimulationCraft gear lines.
//!
//! These operate on the value portion of a simc gear directive (the text after
//! `slot=`). They don't depend on the game-data tables, so both `item_db` and
//! `profileset_generator` can use them without circular imports.

use once_cell::sync::Lazy;
use regex::Regex;

static ENCHANT_ID_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"enchant_id=\d+").unwrap());
static ENCHANT_ID_CAPTURE_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"enchant_id=(\d+)").unwrap());
static GEM_ID_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"gem_id=\d+").unwrap());
static GEM_ID_CAPTURE_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"gem_id=(\d+)").unwrap());
static ITEM_ID_CAPTURE_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"id=(\d+)").unwrap());
static AFTER_ITEM_ID_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"(,id=\d+)").unwrap());
static BONUS_ID_CAPTURE_RE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"bonus_id=([0-9/:]+)").unwrap());
static STRIP_GEM_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r",?gem_id=\d+").unwrap());

/// Replace the existing `enchant_id=N` if present, otherwise insert one right after `,id=N`.
pub fn set_enchant_id(simc: &str, enchant_id: u64) -> String {
    if ENCHANT_ID_RE.is_match(simc) {
        ENCHANT_ID_RE
            .replace(simc, &format!("enchant_id={}", enchant_id))
            .to_string()
    } else {
        AFTER_ITEM_ID_RE
            .replace(simc, &format!("$1,enchant_id={}", enchant_id))
            .to_string()
    }
}

/// Replace the existing `gem_id=N` if present, otherwise insert one right after `,id=N`.
pub fn set_gem_id(simc: &str, gem_id: u64) -> String {
    if GEM_ID_RE.is_match(simc) {
        GEM_ID_RE
            .replace(simc, &format!("gem_id={}", gem_id))
            .to_string()
    } else {
        AFTER_ITEM_ID_RE
            .replace(simc, &format!("$1,gem_id={}", gem_id))
            .to_string()
    }
}

/// Strip any existing `gem_id=N` from a simc gear line (leading comma included).
pub fn strip_gem_id(simc: &str) -> String {
    STRIP_GEM_RE.replace(simc, "").to_string()
}

pub fn extract_enchant_id(simc: &str) -> u64 {
    ENCHANT_ID_CAPTURE_RE
        .captures(simc)
        .and_then(|c| c[1].parse().ok())
        .unwrap_or(0)
}

pub fn extract_gem_id(simc: &str) -> u64 {
    GEM_ID_CAPTURE_RE
        .captures(simc)
        .and_then(|c| c[1].parse().ok())
        .unwrap_or(0)
}

pub fn extract_item_id(simc: &str) -> u64 {
    ITEM_ID_CAPTURE_RE
        .captures(simc)
        .and_then(|c| c[1].parse().ok())
        .unwrap_or(0)
}

/// Parse the comma- or slash-separated bonus_id list from a simc gear line.
/// Returns an empty Vec when no `bonus_id=` is present.
pub fn extract_bonus_ids(simc: &str) -> Vec<u64> {
    BONUS_ID_CAPTURE_RE
        .captures(simc)
        .map(|c| {
            c[1].split(&['/', ':'][..])
                .filter_map(|s| s.parse().ok())
                .collect()
        })
        .unwrap_or_default()
}
