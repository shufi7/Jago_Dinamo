def tentukan_kelulusan_tree(nilai, kehadiran):
    # Root Node: Apakah nilai sudah mencukupi?
    if nilai >= 60:
        # Internal Node (jika nilai cukup): Bagaimana dengan kehadiran?
        if kehadiran >= 75:
            return "Lulus!" # Leaf Node
        else: # Kehadiran kurang dari 75%
            return "Tidak Lulus (Kehadiran kurang)." # Leaf Node
    else: # Nilai kurang dari 60
        return "Tidak Lulus (Nilai kurang)." # Leaf Node

# Contoh penggunaan:
print(f"Nilai 75, Kehadiran 80%: {tentukan_kelulusan_tree(75, 80)}")
print(f"Nilai 50, Kehadiran 90%: {tentukan_kelulusan_tree(50, 90)}")
print(f"Nilai 70, Kehadiran 70%: {tentukan_kelulusan_tree(70, 70)}")