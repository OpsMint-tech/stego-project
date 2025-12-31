import os
import subprocess
import piexif
import json
import re
import numpy as np
from PIL import Image

def run_command(command, input_data=None):
    """
    Helper to run CLI commands and return status/output.
    """
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            input=input_data,
            timeout=30 # Prevent long hangs
        )
        return {
            "status": "Success" if result.returncode == 0 else "Warning",
            "output": (result.stdout + "\n" + result.stderr).strip().splitlines()
        }
    except FileNotFoundError:
        return {"status": "Not Installed", "error": f"{command[0]} command not found"}
    except subprocess.TimeoutExpired:
        return {"status": "Timeout", "error": "Command timed out after 30 seconds"}
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def run_strings(file_path, min_length=4):
    """
    Extracts printable strings from the file.
    """
    cmd_res = run_command(["strings", "-n", str(min_length), file_path])
    if cmd_res["status"] == "Success":
        lines = cmd_res["output"]
        return {
            "status": "Success",
            "count": len(lines),
            "preview": lines[:50]
        }
    return cmd_res

def run_exif(file_path):
    """
    Extracts EXIF metadata using piexif and exiftool if available.
    """
    results = {"piexif": {}, "exiftool": {}}
    
    # Piexif (Python library)
    try:
        exif_dict = piexif.load(file_path)
        readable_exif = {}
        for ifd in exif_dict:
            if ifd == "thumbnail": continue
            readable_exif[ifd] = {}
            for tag in exif_dict[ifd]:
                try:
                    tag_name = piexif.TAGS[ifd][tag]["name"]
                    value = exif_dict[ifd][tag]
                    if isinstance(value, bytes):
                        try: value = value.decode('utf-8')
                        except: value = f"<binary data: {len(value)} bytes>"
                    readable_exif[ifd][tag_name] = value
                except: pass
        results["piexif"] = {"status": "Success", "data": readable_exif}
    except Exception as e:
        results["piexif"] = {"status": "Error", "error": str(e)}
        
    # Exiftool (CLI)
    results["exiftool"] = run_command(["exiftool", file_path])
    
    return results

def run_binwalk(file_path):
    return run_command(["binwalk", file_path])

def run_steghide_check(file_path):
    # Try basic steghide if available
    return run_command(["steghide", "info", file_path], input_data="n")

def run_zsteg(file_path):
    # Runs zsteg -a
    return run_command(["zsteg", "-a", file_path])

def run_outguess(file_path):
    # Note: Brewster outguess might be missing CLI, but checking path
    return run_command(["outguess", "-k", "pass", "-r", file_path, "/dev/null"])

def run_f5(file_path):
    # F5 is usually a Java app, checking if a wrapper script exists
    return run_command(["f5-steganography", "extract", "-p", "", "-e", "/dev/null", file_path])

def run_stegcracker(file_path):
    # Requires a wordlist, we just run to check existence/version
    return run_command(["stegcracker", "--help"])

def run_stegsolve(file_path):
    # Checking if stegsolve jar exists in any common location or just checking java
    return run_command(["java", "-jar", "stegsolve.jar", "check", file_path])

def run_pngcheck(file_path):
    return run_command(["pngcheck", "-v", file_path])

def run_jpegdump(file_path):
    return run_command(["jpegdump", file_path])

def run_stegdetect(file_path):
    return run_command(["stegdetect", file_path])

def run_stegoveritas(file_path):
    # stegoveritas creates a directory, we just run it to get stdout
    return run_command(["stegoveritas", "-v", file_path])

def run_foremost(file_path, output_dir="static/foremost"):
    os.makedirs(output_dir, exist_ok=True)
    return run_command(["foremost", "-v", "-o", output_dir, file_path])

def run_bulk_extractor(file_path, output_dir="static/bulk_extractor"):
    os.makedirs(output_dir, exist_ok=True)
    return run_command(["bulk_extractor", "-o", output_dir, file_path])

def run_exiftool(file_path):
    return run_command(["exiftool", "-G", file_path])

def run_aperisolve_cli(file_path):
    return run_command(["aperisolve", file_path])

def run_lsb_tools(file_path):
    return run_command(["lsb-tools", "analyze", file_path])

def run_lsb_extract(file_path):
    return run_command(["lsbextract", "-i", file_path])

def run_stegano(file_path):
    # Python stegano CLI is named stegano-lsb
    return run_command(["stegano-lsb", "reveal", "-i", file_path])

def run_openstego(file_path):
    return run_command(["openstego", "info", file_path])

def run_camo(file_path):
    return run_command(["camo", "-v", file_path])

def generate_bit_planes(file_path, output_dir):
    """
    Generates bit plane images for the uploaded file.
    """
    try:
        img = Image.open(file_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        pixels = np.array(img)
        os.makedirs(output_dir, exist_ok=True)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        
        channels = ['Red', 'Green', 'Blue']
        generated_files = []
        
        for i, channel in enumerate(channels):
            for bit in [0, 1]: # Just LSB and next bit for brevity
                plane = (pixels[:, :, i] >> bit) & 1
                plane_img = (plane * 255).astype(np.uint8)
                
                out_filename = f"{base_name}_{channel}_Bit{bit}.png"
                out_path = os.path.join(output_dir, out_filename)
                Image.fromarray(plane_img).save(out_path)
                
                generated_files.append({
                    "name": f"{channel} Channel - Bit {bit} ({'LSB' if bit==0 else 'Bit 1'})",
                    "path": f"/static/bitplanes/{out_filename}"
                })

        return {"status": "Success", "planes": generated_files}
        
    except Exception as e:
        return {"status": "Error", "error": str(e)}

