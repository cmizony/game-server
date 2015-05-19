worlds["hardcore"] = "/opt/msm/servers/hardcore/world"

my_smooth_lighting = [Base(),EdgeLines(),SmoothLighting(strength=0.7),Depth(min=0,max=235)]
biome_overlay = [ClearBase(),BiomeOverlay()]

renders["survivalday"] = {
        "world": "hardcore",
        "title": "Day Overworld",
        "rendermode": my_smooth_lighting,
        "dimension": "overworld",
        "crop": (-3000, -3000, 3000, 3000),
        }


renders["survivalbiome"] = {
        "world": "hardcore",
        "title": "Biomes Overworld",
        "rendermode": biome_overlay,
        "dimension": "overworld",
        }


outputdir = "/var/www/html/64571/"
texturepath = "/var/www/html/app/application/third_party/overviewer/ChromaHills-64x1.8_1.0.10.zip"
