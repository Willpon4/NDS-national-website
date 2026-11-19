#!/bin/sh
# Downloads the sponsor logos and board headshots from natdefsoc.org (hosted on Wix)
# into assets/. Run it from anywhere:  sh get-assets.sh
set -e
cd "$(dirname "$0")"
mkdir -p assets/sponsors assets/team

W="https://static.wixstatic.com/media"
get() { curl -fsSL -o "$1" "$2" && echo "saved $1"; }

# Sponsors, in the order they appear on natdefsoc.org/support
get assets/sponsors/sponsor-1.png "$W/e17a34_684ec5d7bd314d619589b5c34285201f~mv2.png"
get assets/sponsors/sponsor-2.png "$W/e17a34_fde0374723564b2190c65f85a0149b3f~mv2.png"
get assets/sponsors/sponsor-3.png "$W/e17a34_686cdf92d5474691b40fb4b5afd0b5e3~mv2.png"
get assets/sponsors/sponsor-4.png "$W/e17a34_07b95d85e35844a9ab96f23a56813e89~mv2.png"

# Board of directors, from natdefsoc.org/team
get assets/team/cian.jpg   "$W/e17a34_3d12790c3d5145dc84da2632b6829b88~mv2.jpg"
get assets/team/collin.jpg "$W/e17a34_dc68351e264e42ec933a633b8947e1c9~mv2.jpg"
get assets/team/grace.jpg  "$W/e17a34_1e948a9b3edd4b5899424c23516437b0~mv2.jpg"
get assets/team/rob.jpg    "$W/e17a34_9955e2f7ef1e4bafa32c884eab7628d1~mv2.jpg"

echo "Done. 8 images saved."
