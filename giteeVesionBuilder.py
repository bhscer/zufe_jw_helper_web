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
os.system("quasar build")
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
print("start file copy")

disPath = "../public"
if os.path.exists("../tmp_git"):
    shutil.rmtree("../tmp_git")

shutil.move(disPath + "/.git", "../tmp_git")
shutil.rmtree(disPath)
shutil.copytree(os.path.abspath("./dist/spa"), os.path.abspath(disPath))
shutil.move("../tmp_git", disPath + "/.git")

print("file copied")
print("=" * 20)
print("")
print("all progress finished")
