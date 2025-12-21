import os
import subprocess
import piexif
import json
import re
import numpy as np
from PIL import Image

def run_strings(file_path, min_length=4):
    """
    Extracts printable strings from the file.
    """
    try:
        result = subprocess.run(
            ["strings", "-n", str(min_length), file_path],
            capture_output=True,
            text=True,
            check=True
        )
        # Limit output to first 1000 characters or 50 lines to avoid massive payloads
        lines = result.stdout.splitlines()
        return {
            "status": "Success",
            "count": len(lines),
            "preview": lines[:50]
        }
    except FileNotFoundError:
        return {"status": "Not Installed", "error": "strings command not found"}
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def run_exif(file_path):
    """
    Extracts EXIF metadata using piexif.
    """
    try:
        exif_dict = piexif.load(file_path)
        # Convert bytes to string for JSON serialization
        readable_exif = {}
        for ifd in exif_dict:
            if ifd == "thumbnail":
                continue
            readable_exif[ifd] = {}
            for tag in exif_dict[ifd]:
                try:
                    tag_name = piexif.TAGS[ifd][tag]["name"]
                    value = exif_dict[ifd][tag]
                    if isinstance(value, bytes):
                        try:
                            value = value.decode('utf-8')
                        except:
                            value = f"<binary data: {len(value)} bytes>"
                    readable_exif[ifd][tag_name] = value
                except:
                    pass
        return {"status": "Success", "data": readable_exif}
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def run_binwalk(file_path):
    """
    Runs binwalk to check for embedded files.
    """
    try:
        # Try running binwalk command line
        result = subprocess.run(
            ["binwalk", file_path],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return {
                "status": "Success",
                "output": result.stdout.splitlines()
            }
        else:
             return {"status": "Error", "error": result.stderr}
    except FileNotFoundError:
        return {"status": "Not Installed", "error": "binwalk command not found"}
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def run_steghide_check(file_path):
    """
    Checks if steghide can extract data.
    """
    try:
        # steghide info file_path
        result = subprocess.run(
            ["steghide", "info", file_path],
            capture_output=True,
            text=True,
            input="n" # Answer no if asked for passphrase interactively
        )
        return {
            "status": "Executed",
            "output": result.stdout if result.stdout else result.stderr
        }
    except FileNotFoundError:
        return {"status": "Not Installed", "error": "steghide command not found"}
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def run_zsteg(file_path):
    """
    Runs zsteg on the file (PNG/BMP only).
    """
    try:
        # Check if zsteg is installed
        subprocess.run(["zsteg", "--version"], capture_output=True, check=True)
        
        result = subprocess.run(
            ["zsteg", "-a", file_path], # -a for all checks
            capture_output=True,
            text=True
        )
        
        # Parse output slightly to make it JSON friendly
        lines = result.stdout.splitlines()
        parsed_lines = []
        for line in lines:
            if line.strip():
                parsed_lines.append(line.strip())
                
        return {
            "status": "Success",
            "output": parsed_lines
        }
    except FileNotFoundError:
        return {"status": "Not Installed", "error": "zsteg command not found (requires Ruby gem install zsteg)"}
    except subprocess.CalledProcessError:
        return {"status": "Not Installed", "error": "zsteg command failed or not found"}
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def generate_bit_planes(file_path, output_dir):
    """
    Generates bit plane images for the uploaded file.
    Saves them to output_dir.
    Returns a list of relative paths to the generated images.
    """
    try:
        img = Image.open(file_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        pixels = np.array(img)
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        
        channels = ['Red', 'Green', 'Blue']
        generated_files = []
        
        for i, channel in enumerate(channels):
            # Bit 0 (LSB)
            bit = 0
            plane = (pixels[:, :, i] >> bit) & 1
            # Scale to 0-255
            plane_img = (plane * 255).astype(np.uint8)
            
            out_filename = f"{base_name}_{channel}_Bit{bit}.png"
            out_path = os.path.join(output_dir, out_filename)
            Image.fromarray(plane_img).save(out_path)
            
            generated_files.append({
                "name": f"{channel} Channel - Bit {bit} (LSB)",
                "path": f"http://localhost:8000/static/bitplanes/{out_filename}"
            })
            
            # Bit 1
            bit = 1
            plane = (pixels[:, :, i] >> bit) & 1
            plane_img = (plane * 255).astype(np.uint8)
            out_filename = f"{base_name}_{channel}_Bit{bit}.png"
            out_path = os.path.join(output_dir, out_filename)
            Image.fromarray(plane_img).save(out_path)
            
            generated_files.append({
                "name": f"{channel} Channel - Bit {bit}",
                "path": f"http://localhost:8000/static/bitplanes/{out_filename}"
            })

        return {"status": "Success", "planes": generated_files}
        
    except Exception as e:
        return {"status": "Error", "error": str(e)}
