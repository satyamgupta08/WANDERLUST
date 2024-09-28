const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let flashMessage = req.flash("error"); // Get flash message from session
    let allListings;

  const url = '/listings'; // Adjust this based on your routing structure

    const handleEmptySearch = () => {
        req.flash("error", "Search value empty!!!");
        return res.redirect(url);
    };

    const formatSearchInput = (input) => {
        return input.trim().replace(/\s+/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    };

    const searchListings = async (element) => {
        const queries = [
            { title: { $regex: element, $options: "i" }, ...(category && { category }) },
            { category: { $regex: element, $options: "i" } },
            { country: { $regex: element, $options: "i" } },
            { location: { $regex: element, $options: "i" }, ...(category && { category }) }
        ];

        for (const query of queries) {
            const listings = await Listing.find(query).sort({ _id: -1 });
            if (listings.length) {
                return { listings, message: `Listings searched by ${Object.keys(query)[0]}` };
            }
        }

        return null;
    };

    const searchByPrice = async (comparison, value) => {
        const intValue = parseInt(value, 10);
        if (Number.isInteger(intValue)) {
            const operator = comparison === "Greater" ? "$gte" : "$lte";
            const listings = await Listing.find({ price: { [operator]: intValue }, ...(category && { category }) }).sort({ price: comparison === "Greater" ? -1 : 1 });
            if (listings.length) {
                return { listings, message: `Listings searched for ${comparison.toLowerCase()} than Rs ${intValue}` };
            }
        }
        return null;
    };

    if (search) {
        const input = req.query.search.trim();
        if (!input) {
            return handleEmptySearch();
        }

        const element = formatSearchInput(input);
        let result = await searchListings(element);
        if (result) {
            res.locals.success = result.message;
            return res.render("listings/index.ejs", { allListings: result.listings,flashMessage });
        }

        const arr = element.split(" ");
        if (["Greater", "Less"].includes(arr[0])) {
            result = await searchByPrice(arr[0], arr[2]);
            if (result) {
                res.locals.success = result.message;
                return res.render("listings/index.ejs", { allListings: result.listings,flashMessage });
            }
        }

        req.flash("error", "Listings are not here!!!");
        return res.redirect("/listings");
    }

    allListings = category ? await Listing.find({ category }) : await Listing.find({});
    if (!allListings.length) {
        req.flash("error", "No listings found for this filter");
        flashMessage = req.flash("error");
    }

    res.render("listings/index.ejs", { allListings, flashMessage });
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
        return;
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
        return;
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};
