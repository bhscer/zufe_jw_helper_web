import os
import shutil

print("=" * 20)
print("start setting config")

with open("quasar.config.js.gitee", "r") as f:
    content = f.read()

with open("quasar.config.js", "w") as f:
    f.write(content)

print("config.gitee ok")
print("=" * 20)

print(" ")

print("=" * 20)
print("start build progress")
os.system("npm run build")
print("build progress finished")
print("=" * 20)

print(" ")

print("=" * 20)
print("start restoreing config")

with open("quasar.config.js.bak", "r") as f:
    content = f.read()

with open("quasar.config.js", "w") as f:
    f.write(content)

print("config restored")
print("=" * 20)

print("")
print("=" * 20)
print("all progress finished")
