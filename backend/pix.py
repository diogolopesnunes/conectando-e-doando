from pathlib import Path
import qrcode, unicodedata

def _norm(s: str) -> str:
    return unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode().upper()

def _f(id_: str, v: str) -> str:
    return f"{id_}{len(v):02}{v}"

def _crc16(s: str) -> str:
    reg = 0xFFFF
    for b in s.encode("utf-8"):
        reg ^= b << 8
        for _ in range(8):
            reg = ((reg << 1) ^ 0x1021) if (reg & 0x8000) else (reg << 1)
            reg &= 0xFFFF
    return f"{reg:04X}"

def payload_pix(chave, nome, cidade, valor, txid="***"):
    nome = _norm(nome).strip()[:25]
    cidade = _norm(cidade).strip()[:15]
    valor = f"{valor:.2f}"
    mai = _f("26", _f("00", "BR.GOV.BCB.PIX") + _f("01", chave))
    partes = [
        _f("00", "01"),
        mai,
        _f("52", "0000"),
        _f("53", "986"),
        _f("54", valor),
        _f("58", "BR"),
        _f("59", nome),
        _f("60", cidade),
        _f("62", _f("05", txid)),
    ]
    base = "".join(partes) + "6304"
    return base + _crc16(base)

def gerar_qrcode_pix(chave, nome, cidade, valor, arquivo, txid="***"):
    pasta = Path("QRCodePix")
    pasta.mkdir(exist_ok=True)

    caminho_completo = pasta / arquivo

    pay = payload_pix(chave, nome, cidade, valor, txid)
    qrcode.make(pay).save(str(caminho_completo))
