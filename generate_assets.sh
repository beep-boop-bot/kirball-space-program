declare -A colors=( ['primary']='#78c2ad' ['secondary']='#f3969a' ['success']='#56cc9d' ['danger']='#ff7851' ['warning']='#ffce67' ['info']='#6cc3d5' ['orange']='#fd7e14' ['indigo']='#6610f2' ['cyan']='#6cc3d5' ['purple']='#6f42c1' ['blue']='#007bff' )
declare -A darks=( ['primary']='#3e655a' ['secondary']='#7e4e50' ['success']='#2d6a52' ['danger']='#853e2a' ['warning']='#856b36' ['info']='#38656f' ['orange']='#a8530d' ['indigo']='#400b96' ['cyan']='#3e707a' ['purple']='#3a2366' ['blue']='#004fa3' )
declare -A lights=( ['primary']='#d9eee8' ['secondary']='#fce2e3' ['success']='#d0f1e4' ['danger']='#ffd9ce' ['warning']='#fff1d4' ['info']='#d6eef3' ['orange']='#ffe6d2' ['indigo']='#dac5fc' ['cyan']='#b7e2eb' ['purple']='#dcd1f0' ['blue']='#bdddff' )

for color in 'primary' 'secondary' 'success' 'danger' 'warning' 'info' 'orange' 'indigo' 'cyan' 'purple' 'blue' ; do
    export COLORNAME=$color
    export NORMALCOLOR="${colors[$color]}"
    export DARK="${darks[$color]}"
    export LIGHT="${lights[$color]}"
    envsubst < template_smile.svg > assets/smile_$color.svg
    envsubst < template_agape.svg > assets/agape_$color.svg
    envsubst < template_ufo.svg   > assets/ufo_$color.svg
done