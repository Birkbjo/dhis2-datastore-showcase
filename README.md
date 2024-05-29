This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Showcase the use of DHIS2 dataStore-API in react

Showcases how to implement a simple todo list using the `dhis2` `dataStore-API`. Also shows the use of `app-runtime` data hooks with typescript.


**We should always validate data from the dataStore**. The `dataStore` is just a key-value store, and no validation (other than valid JSON) is done on the server side. We should therefore always validate the data before any use. 

Thus, I felt compelled to include an example of how I would do that as well, using `zod`. Please see `TodosWithValidation.tsx` and `useDataStoreWithValidation` for a more complete implementation.

