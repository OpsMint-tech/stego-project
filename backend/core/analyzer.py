import os
from PIL import Image
import numpy as np
from core.deepvision import get_deepvision_score

def analyze_image(file_path):
    results = {
        "filename": os.path.basename(file_path),
        "size_bytes": os.path.getsize(file_path),
        "metadata": {},
        "lsb_analysis": {},
        "deepvision_score": 0
    }
    
    try:
        with Image.open(file_path) as img:
            results["format"] = img.format
            results["mode"] = img.mode
            results["dimensions"] = img.size
            
            # Metadata extraction (basic)
            if hasattr(img, 'info'):
                results["metadata"] = {k: str(v) for k, v in img.info.items()}
            
            # LSB Analysis (Simplified statistical check)
            # Convert to RGB if not already
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            pixels = np.array(img)
            # Extract LSBs
            lsb = pixels & 1
            lsb_mean = np.mean(lsb)
            
            # Basic heuristic: if LSBs are perfectly random (0.5 mean), might be hidden data
            # Natural images often have LSB mean slightly off 0.5 or specific patterns
            # This is a very rough heuristic for demonstration
            suspicion_level = "Low"
            if 0.45 < lsb_mean < 0.55:
                suspicion_level = "Medium"
            
            results["lsb_analysis"] = {
                "mean_lsb_value": float(lsb_mean),
                "heuristic_suspicion": suspicion_level
            }
            
            # Deepvision AI Score
            results["deepvision_score"] = get_deepvision_score(pixels)
            
            # Advanced Tools Integration
            from core.tools import (
                run_strings, run_exif, run_binwalk, run_steghide_check, 
                run_zsteg, run_outguess, run_f5, run_stegcracker, 
                run_stegsolve, run_pngcheck, run_jpegdump, run_stegdetect, 
                run_stegoveritas, run_foremost, run_bulk_extractor, 
                run_exiftool, run_aperisolve_cli, run_lsb_tools, run_lsb_extract, 
                run_stegano, run_openstego, run_camo, generate_bit_planes
            )
            
            # Generate bit planes
            bit_planes_dir = "static/bitplanes"
            bit_planes_result = generate_bit_planes(file_path, bit_planes_dir)
            
            results["tool_reports"] = {
                "strings": run_strings(file_path),
                "exif": run_exif(file_path),
                "binwalk": run_binwalk(file_path),
                "steghide": run_steghide_check(file_path),
                "zsteg": run_zsteg(file_path),
                "outguess": run_outguess(file_path),
                "f5": run_f5(file_path),
                "stegcracker": run_stegcracker(file_path),
                "stegsolve": run_stegsolve(file_path),
                "pngcheck": run_pngcheck(file_path),
                "jpegdump": run_jpegdump(file_path),
                "stegdetect": run_stegdetect(file_path),
                "stegoveritas": run_stegoveritas(file_path),
                "foremost": run_foremost(file_path),
                "bulk_extractor": run_bulk_extractor(file_path),
                "exiftool": run_exiftool(file_path),
                "aperisolve": run_aperisolve_cli(file_path),
                "lsb_tools": run_lsb_tools(file_path),
                "lsb_extract": run_lsb_extract(file_path),
                "stegano": run_stegano(file_path),
                "openstego": run_openstego(file_path),
                "camo": run_camo(file_path),
                "bit_planes": bit_planes_result
            }
            
            # Final Report / Conclusion
            suspicion_points = 0
            reasons = []
            
            # Check LSB
            if results["lsb_analysis"]["heuristic_suspicion"] != "Low":
                suspicion_points += 20
                reasons.append("LSB statistics indicate potential hidden data.")
                
            # Check Deepvision Score
            if results["deepvision_score"]["score"] > 60:
                suspicion_points += 30
                reasons.append(f"Deepvision AI detected anomalies (Score: {results['deepvision_score']['score']}).")
                
            # Check Binwalk
            if results["tool_reports"]["binwalk"]["status"] == "Success" and len(results["tool_reports"]["binwalk"]["output"]) > 1:
                suspicion_points += 40
                reasons.append("Binwalk detected embedded files or signatures.")
                
            # Check Zsteg
            if results["tool_reports"]["zsteg"]["status"] == "Success" and len(results["tool_reports"]["zsteg"]["output"]) > 0:
                 suspicion_points += 40
                 reasons.append("Zsteg found hidden data in PNG/BMP structure.")

            # Check PNGCheck
            if results["tool_reports"]["pngcheck"]["status"] == "Warning":
                 suspicion_points += 15
                 reasons.append("PNGCheck found structural inconsistencies in the image.")

            # Check Steghide/Outguess (if they output anything beyond basic info)
            if results["tool_reports"]["steghide"]["status"] == "Success" and any("capacity" in line.lower() for line in results["tool_reports"]["steghide"]["output"]):
                 # This is just info, but if it found data it would be higher
                 pass

            # Check Stegano (Python)
            if results["tool_reports"]["stegano"]["status"] == "Success":
                 suspicion_points += 50
                 reasons.append("Python Stegano successfully revealed hidden text.")

            final_verdict = "Safe"
            if suspicion_points > 30:
                final_verdict = "Suspicious"
            if suspicion_points > 70:
                final_verdict = "Highly Suspicious / Malicious"
                
            results["final_report"] = {
                "verdict": final_verdict,
                "suspicion_score": min(suspicion_points, 100),
                "summary": reasons if reasons else ["No significant anomalies detected."]
            }
            
    except Exception as e:
        results["error"] = str(e)
        
    return results
